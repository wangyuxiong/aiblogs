#!/usr/bin/env python3
"""Static acceptance tests for the Mind Keeper personal brand site."""

import datetime
import re
import tempfile
import unittest
from html.parser import HTMLParser
from pathlib import Path
from unittest import mock
from urllib.parse import unquote, urljoin, urlsplit

ROOT = Path(__file__).resolve().parents[1]
DIST = ROOT / "dist"
POSITIONING_TEXT = "AI 产品与工程实践"
SITE_HOST = "mind-keeper.com"
# External download links may be added only after live verification of the target.
VERIFIED_EXTERNAL_DOWNLOADS = frozenset()
HOMEPAGE_SECTION_IDS = (
    "learning-path",
    "projects",
    "original-articles",
    "latest-daily",
)
LEARNING_PATH_TITLE = "AI Agent：从入门到做出第一个工具"
PROJECT_NAMES = ("文心启航", "Mind Keeper 日报系统")
REPRESENTATIVE_METADATA_PAGES = (
    ("index", "https://mind-keeper.com"),
    ("blog", "https://mind-keeper.com/blog"),
    ("daily", "https://mind-keeper.com/daily"),
    ("portfolio", "https://mind-keeper.com/portfolio"),
    ("about", "https://mind-keeper.com/about"),
    (
        "portfolio/writing-coach",
        "https://mind-keeper.com/portfolio/writing-coach",
    ),
    (
        "blog/2026-05-07-anthropic-bugcrawl-deep-dive",
        "https://mind-keeper.com/blog/2026-05-07-anthropic-bugcrawl-deep-dive",
    ),
    (
        "blog/ai-daily-2026-11-05",
        "https://mind-keeper.com/blog/ai-daily-2026-11-05",
    ),
)
DAILY_PATH_PREFIXES = ("/blog/ai-daily-", "/blog/ai-hot-daily-")
DAILY_DATE_RE = re.compile(
    r"^/blog/(?:ai-daily-|ai-hot-daily-)(\d{4}-\d{2}-\d{2})(?:/|$)"
)
LATEST_UPDATE_RE = re.compile(
    r"(?:最近|最新|最后)\s*更新\s*[：:]?\s*"
    r"(\d{4})\s*(?:-|/|\.|年)\s*(\d{1,2})\s*(?:-|/|\.|月)\s*(\d{1,2})\s*日?"
    r"(?!\d)"
)
PERCENT_RE = re.compile(r"(?<!\d)(?:\d{1,2}|100)\s*%")
SKILL_PERCENTAGE_RE = re.compile(
    r"(?<![\w.])(?:React(?:\s*/\s*Next(?:\.js)?)?|TypeScript|Node(?:\.js)?|"
    r"AI\s*(?:工作流|workflow)(?:\s*/\s*Agent)?|内容创作|content\s+creation|"
    r"SEO(?:\s*/\s*营销)?)(?![\w.])\s*[:：]?\s*(?<!\d)(?:\d{1,2}|100)\s*%"
    r"(?!\s*原创)",
    re.IGNORECASE,
)
FAKE_WRITING_EXAMPLES = (
    "每个人都有自己的梦想，有的想当科学家，有的想当医生，而我最想成为一名宇航员",
    "那是一个阳光明媚的下午，我站在领奖台上，看着台下热烈的掌声，心中百感交集",
    "从蒸汽机到互联网，从智能手机到人工智能，科技的每一次进步都在深刻地改变着人类的生活方式",
)


def read_page(name):
    """Read a generated HTML page by its dist-relative name."""
    path = DIST / f"{name}.html"
    try:
        return path.read_text(encoding="utf-8")
    except FileNotFoundError:
        try:
            display_path = path.relative_to(ROOT)
        except ValueError:
            display_path = path
        raise AssertionError(
            f"Missing generated page: {display_path}. "
            "Run 'pnpm build' before 'pnpm test:brand'."
        ) from None


class _SectionParser(HTMLParser):
    def __init__(self, html, start_id):
        super().__init__(convert_charrefs=True)
        self.html = html
        self.start_id = start_id
        self.line_offsets = [0]
        self.line_offsets.extend(match.end() for match in re.finditer("\n", html))
        self.start = None
        self.end = None
        self.root_tag = None
        self.depth = 0

    def current_offset(self):
        line, column = self.getpos()
        return self.line_offsets[line - 1] + column

    def handle_starttag(self, tag, attrs):
        element_id = dict(attrs).get("id")
        offset = self.current_offset()

        if self.start is None:
            if element_id == self.start_id:
                self.start = offset
                self.root_tag = tag
                self.depth = 1
            return

        if self.end is not None:
            return

        if tag == self.root_tag:
            self.depth += 1

    def handle_endtag(self, tag):
        if self.start is not None and self.end is None and tag == self.root_tag:
            self.depth -= 1
            if self.depth == 0:
                self.end = self.current_offset()


def section(html, start_id):
    """Return HTML through the matching close of the element with start_id."""
    parser = _SectionParser(html, start_id)
    parser.feed(html)
    parser.close()

    if parser.start is None:
        raise AssertionError(f"Missing required section id={start_id!r}.")
    if parser.end is None:
        raise AssertionError(f"Section id={start_id!r} has no closing </{parser.root_tag}>.")

    return html[parser.start : parser.end]


class _PageParser(HTMLParser):
    """Inspect rendered HTML without interpreting inline or external JavaScript."""

    def __init__(self):
        super().__init__(convert_charrefs=True)
        self._hidden_depth = 0
        self._element_stack = []
        self._level_bar_depth = 0
        self._in_title = False
        self._title_chunks = []
        self._text_chunks = []
        self._control = None
        self.links = []
        self.anchor_links = []
        self.public_urls = []
        self.hash_links = []
        self.download_controls = []
        self.level_percentages = []

    @property
    def title(self):
        return "".join(self._title_chunks).strip()

    @property
    def visible_text(self):
        return " ".join(" ".join(self._text_chunks).split())

    @property
    def compact_text(self):
        return re.sub(r"\s+", "", self.visible_text)

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        level_name = re.sub(
            r"[_-]+", " ", f"{attrs.get('class', '')} {attrs.get('id', '')}"
        )
        is_level_bar = (
            re.search(
                r"(?:^|\s)(?:level|skills?|progress)(?:$|\s)",
                level_name,
                re.IGNORECASE,
            )
            is not None
            or "data-level" in attrs
            or attrs.get("role", "").lower() == "progressbar"
            or tag == "progress"
        )
        self._element_stack.append((tag, is_level_bar))
        if is_level_bar:
            self._level_bar_depth += 1
        if self._level_bar_depth:
            for attribute in (
                "style",
                "data-level",
                "aria-valuenow",
                "aria-valuetext",
                "value",
            ):
                value = (attrs.get(attribute) or "").strip()
                percentage = PERCENT_RE.search(value)
                numeric_level = (
                    re.fullmatch(r"(?:\d{1,2}|100)(?:\.\d+)?", value)
                    and (
                        attribute == "data-level"
                        or (
                            attribute == "aria-valuenow"
                            and (
                                attrs.get("aria-valuemax") == "100"
                                or attrs.get("role", "").lower() == "progressbar"
                            )
                        )
                        or (attribute == "value" and tag == "progress")
                    )
                )
                if percentage or numeric_level:
                    self.level_percentages.append(f"{attribute}={value}")
                    break

        if tag in {"head", "script", "style", "noscript"}:
            self._hidden_depth += 1
        if tag == "title":
            self._in_title = True

        for attribute in ("href", "src"):
            value = attrs.get(attribute)
            if value is not None:
                self.public_urls.append(value)
                if attribute == "href" and value.strip() == "#":
                    self.hash_links.append((tag, value))

        if tag == "meta" and attrs.get("property", "").lower() == "og:url":
            content = attrs.get("content")
            if content is not None:
                self.public_urls.append(content)

        if tag == "a":
            href = attrs.get("href")
            if href is not None:
                self.links.append(href)

        if tag in {"a", "button"}:
            self._control = (tag, attrs.get("href"), [], [])

    def handle_endtag(self, tag):
        for index in range(len(self._element_stack) - 1, -1, -1):
            if self._element_stack[index][0] == tag:
                closed_elements = self._element_stack[index:]
                del self._element_stack[index:]
                self._level_bar_depth -= sum(
                    is_level_bar for _, is_level_bar in closed_elements
                )
                break

        if self._control is not None and tag == self._control[0]:
            control_tag, href, chunks, visible_chunks = self._control
            label = " ".join("".join(chunks).split())
            visible_label = " ".join("".join(visible_chunks).split())
            if control_tag == "a":
                self.anchor_links.append((href, visible_label))
            if "下载" in label:
                self.download_controls.append((control_tag, href, label))
            self._control = None

        if tag == "title":
            self._in_title = False
        if tag in {"head", "script", "style", "noscript"} and self._hidden_depth:
            self._hidden_depth -= 1

    def handle_data(self, data):
        if self._in_title:
            self._title_chunks.append(data)
        if not self._hidden_depth and data.strip():
            self._text_chunks.append(data)
        if self._control is not None:
            self._control[2].append(data)
            if not self._hidden_depth:
                self._control[3].append(data)


class _ShellParser(HTMLParser):
    """Inspect global navigation, metadata, and keyboard landmarks in rendered HTML."""

    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.navigations = []
        self.anchors = []
        self.footer_anchors = []
        self.footer_text_chunks = []
        self.main_attributes = []
        self.meta_tags = []
        self.link_tags = []
        self.buttons = []
        self._nav_stack = []
        self._anchor = None
        self._footer_depth = 0

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == "nav":
            navigation = {"attributes": attrs, "links": []}
            self.navigations.append(navigation)
            self._nav_stack.append(navigation)
        elif tag == "main":
            self.main_attributes.append(attrs)
        elif tag == "meta":
            self.meta_tags.append(attrs)
        elif tag == "link":
            self.link_tags.append(attrs)
        elif tag == "button":
            self.buttons.append(attrs)
        elif tag == "footer":
            self._footer_depth += 1

        if tag == "a":
            self._anchor = {"attributes": attrs, "chunks": [], "text": ""}
            self.anchors.append(self._anchor)
            if self._nav_stack:
                self._nav_stack[-1]["links"].append(self._anchor)
            if self._footer_depth:
                self.footer_anchors.append(self._anchor)

    def handle_endtag(self, tag):
        if tag == "a" and self._anchor is not None:
            self._anchor["text"] = " ".join("".join(self._anchor.pop("chunks")).split())
            self._anchor = None
        elif tag == "nav" and self._nav_stack:
            self._nav_stack.pop()
        elif tag == "footer" and self._footer_depth:
            self._footer_depth -= 1

    def handle_data(self, data):
        if self._anchor is not None:
            self._anchor["chunks"].append(data)
        if self._footer_depth and data.strip():
            self.footer_text_chunks.append(data)

    @property
    def footer_text(self):
        return " ".join(" ".join(self.footer_text_chunks).split())


def parse_html(html):
    parser = _PageParser()
    parser.feed(html)
    parser.close()
    return parser


def parse_shell(html):
    parser = _ShellParser()
    parser.feed(html)
    parser.close()
    return parser


def parse_page(name):
    return parse_html(read_page(name))


def split_url(url):
    """Parse a URL, reporting malformed input as an acceptance failure."""
    try:
        parts = urlsplit(url)
        parts.hostname
        parts.port
    except ValueError:
        raise AssertionError(f"Invalid URL: {url!r}") from None
    return parts


def is_local_http_url(parts):
    return parts.scheme in {"", "http", "https"} and (
        not parts.netloc or (parts.hostname or "").rstrip(".") == SITE_HOST
    )


def daily_links(page):
    """Return local links under the daily path, regardless of their suffix."""
    matches = []
    for href in page.links:
        parts = split_url(href)
        if is_local_http_url(parts) and parts.path.startswith(DAILY_PATH_PREFIXES):
            matches.append(href)
    return matches


def dated_daily_links(page):
    """Return local daily links with a date usable for latest-update checks."""
    matches = []
    for href in daily_links(page):
        match = DAILY_DATE_RE.match(split_url(href).path)
        if match:
            date_text = match.group(1)
            try:
                datetime.date.fromisoformat(date_text)
            except ValueError:
                raise AssertionError(
                    f"Daily link {href!r} uses an invalid calendar date: {date_text}."
                ) from None
            matches.append((href, date_text))
    return matches


def download_control_error(tag, href, page_name):
    """Return why a download control is unusable, or None when it is valid."""
    if tag != "a":
        return "is a dead <button>; use a real link with a download target"
    if href is None or not href.strip():
        return f"must have a usable href, got {href!r}"

    value = href.strip()
    try:
        parts = urlsplit(value)
        hostname = parts.hostname
        parts.port
    except ValueError:
        return f"has an invalid URL: {href!r}"

    if parts.scheme not in {"", "http", "https"}:
        return f"must use an HTTP(S) or local URL, got {href!r}"
    if parts.scheme and not parts.netloc:
        return f"has an invalid absolute URL: {href!r}"
    if parts.netloc and not parts.path.strip("/"):
        return f"must target a non-root external path, got {href!r}"
    if parts.netloc and (hostname or "").rstrip(".") != SITE_HOST:
        if value not in VERIFIED_EXTERNAL_DOWNLOADS:
            return (
                "is not in VERIFIED_EXTERNAL_DOWNLOADS; live verification is required: "
                f"{href!r}"
            )
        return None
    if not parts.path:
        return f"must target a download rather than a fragment or empty path, got {href!r}"

    try:
        local_path = urlsplit(urljoin(f"/{page_name}", value)).path
        target = (DIST / unquote(local_path).lstrip("/")).resolve()
        target.relative_to(DIST.resolve())
    except (OSError, ValueError):
        return f"must resolve to an existing file under dist, got {href!r}"
    if not target.is_file():
        return f"must resolve to an existing file under dist, got {href!r}"
    return None


def is_hello_world_url(url):
    parts = split_url(url)
    return is_local_http_url(parts) and re.search(
        r"(?:^|/)hello-world(?:\.html)?/?$", parts.path
    ) is not None


def original_article_links(page):
    """Return local article links that are neither daily reports nor the draft."""
    matches = []
    for href in page.links:
        parts = split_url(href)
        if not is_local_http_url(parts):
            continue
        if not parts.path.startswith("/blog/") or parts.path.startswith(DAILY_PATH_PREFIXES):
            continue
        if parts.path.rstrip("/") == "/blog" or is_hello_world_url(href):
            continue
        matches.append(href)
    return matches


def generated_article_target_error(href):
    """Return why a local article URL has no generated HTML target."""
    parts = split_url(href)
    article_path = unquote(parts.path).rstrip("/")
    if not article_path.endswith(".html"):
        article_path += ".html"
    try:
        blog_root = (DIST / "blog").resolve()
        target = (DIST / article_path.lstrip("/")).resolve()
        target.relative_to(blog_root)
    except (OSError, ValueError):
        return "must resolve to a generated article under dist/blog/"
    if not target.is_file():
        return f"has no generated article target under dist/blog/: {href!r}"
    return None


def homepage_article_link_errors(page, required_hrefs):
    """Check visible labels and generated targets for required article links."""
    required_hrefs = set(required_hrefs)
    errors = []
    for href, label in page.anchor_links:
        if href not in required_hrefs:
            continue
        if not label:
            errors.append(f"{href!r} has no visible non-empty anchor text")
        target_error = generated_article_target_error(href)
        if target_error:
            errors.append(target_error)
    return errors


def public_html_files():
    if not DIST.is_dir():
        raise AssertionError("Missing dist/. Run 'pnpm build' before 'pnpm test:brand'.")
    return sorted(
        path
        for path in DIST.rglob("*.html")
        if "_next" not in path.relative_to(DIST).parts
    )


class BrandSiteAcceptanceTests(unittest.TestCase):
    def test_global_navigation_labels_and_order(self):
        shell = parse_shell(read_page("index"))
        expected_links = [
            ("/blog", "文章"),
            ("/portfolio", "项目"),
            ("/daily", "日报"),
            ("/about", "关于"),
        ]
        self.assertEqual(
            ["主导航", "移动端导航"],
            [nav["attributes"].get("aria-label") for nav in shell.navigations],
            "Desktop and mobile navigation must have explicit, distinct accessible names.",
        )
        for navigation in shell.navigations:
            with self.subTest(navigation=navigation["attributes"].get("aria-label")):
                self.assertEqual(
                    expected_links,
                    [
                        (link["attributes"].get("href"), link["text"])
                        for link in navigation["links"]
                    ],
                    "Both navigation variants must use the global labels and order.",
                )

    def test_article_navigation_marks_the_content_section(self):
        cases = (
            ("blog/2026-05-07-anthropic-bugcrawl-deep-dive", "/blog"),
            ("blog/ai-daily-2026-11-05", "/daily"),
            ("blog/ai-hot-daily-2026-05-25", "/daily"),
        )
        for page_name, expected_href in cases:
            shell = parse_shell(read_page(page_name))
            navigations = [
                navigation
                for navigation in shell.navigations
                if navigation["attributes"].get("aria-label")
                in {"主导航", "移动端导航"}
            ]
            self.assertEqual(2, len(navigations))
            for navigation in navigations:
                with self.subTest(
                    page=page_name,
                    navigation=navigation["attributes"].get("aria-label"),
                ):
                    self.assertEqual(
                        [expected_href],
                        [
                            link["attributes"].get("href")
                            for link in navigation["links"]
                            if "aria-current" in link["attributes"]
                        ],
                        "Original articles must mark /blog active; both daily slug "
                        "families must mark /daily active instead.",
                    )

    def test_keyboard_skip_link_targets_main_content(self):
        shell = parse_shell(read_page("index"))
        skip_links = [link for link in shell.anchors if link["text"] == "跳到正文"]
        self.assertEqual(1, len(skip_links), "There must be one visible-on-focus skip link.")
        skip_link = skip_links[0]
        self.assertIs(skip_link, shell.anchors[0], "The skip link must be the first link.")
        self.assertEqual("#main-content", skip_link["attributes"].get("href"))
        class_names = skip_link["attributes"].get("class", "").split()
        self.assertIn("sr-only", class_names)
        self.assertIn(
            "focus:not-sr-only",
            class_names,
            "The skip link must become visible when it receives keyboard focus.",
        )
        self.assertEqual(
            ["main-content"],
            [attributes.get("id") for attributes in shell.main_attributes],
            "The root layout must provide one main landmark targeted by the skip link.",
        )
        self.assertEqual(
            ["-1"],
            [attributes.get("tabindex") for attributes in shell.main_attributes],
            "The skip-link target must be programmatically focusable.",
        )

    def test_ssr_mobile_navigation_is_closed_and_toggle_targets_it(self):
        shell = parse_shell(read_page("index"))
        mobile_navigations = [
            navigation
            for navigation in shell.navigations
            if navigation["attributes"].get("aria-label") == "移动端导航"
        ]
        self.assertEqual(1, len(mobile_navigations))
        mobile_navigation = mobile_navigations[0]
        navigation_attributes = mobile_navigation["attributes"]
        self.assertEqual("true", navigation_attributes.get("aria-hidden"))
        self.assertIn(
            "inert",
            navigation_attributes,
            "The SSR-closed mobile navigation must be unfocusable without JavaScript.",
        )

        toggles = [
            button
            for button in shell.buttons
            if button.get("aria-label") == "打开导航菜单"
        ]
        self.assertEqual(1, len(toggles))
        toggle = toggles[0]
        self.assertEqual("false", toggle.get("aria-expanded"))
        controlled_id = toggle.get("aria-controls")
        self.assertTrue(controlled_id, "The mobile menu toggle needs aria-controls.")
        controlled_navigations = [
            navigation
            for navigation in shell.navigations
            if navigation["attributes"].get("id") == controlled_id
        ]
        self.assertEqual(1, len(controlled_navigations))
        self.assertIs(mobile_navigation, controlled_navigations[0])

    def test_global_metadata_uses_site_config_without_unverified_handles(self):
        homepage = read_page("index")
        shell = parse_shell(homepage)
        metadata = {}
        for attributes in shell.meta_tags:
            key = attributes.get("name") or attributes.get("property")
            if key:
                metadata[key.lower()] = attributes.get("content", "")

        self.assertEqual("Mind Keeper | AI 产品与工程实践", parse_html(homepage).title)
        self.assertEqual(
            "面向 AI 学习者的教程、真实项目复盘，以及每天筛选的 AI 技术与产品动态。",
            metadata.get("description"),
        )
        for name in ("twitter:site", "twitter:creator"):
            with self.subTest(metadata=name):
                self.assertNotIn(name, metadata, "Unverified Twitter handles must be removed.")
        for attributes in shell.meta_tags:
            if attributes.get("name", "").lower() == "google-site-verification":
                self.assertTrue(
                    attributes.get("content", "").strip(),
                    "Google verification metadata must never be empty.",
                )

        self.assertEqual(
            "https://mind-keeper.com/images/og-default.png", metadata.get("og:image")
        )
        self.assertTrue(
            (DIST / "images" / "og-default.png").is_file(),
            "The default Open Graph image must exist in dist.",
        )
        rss_links = [
            attributes.get("href")
            for attributes in shell.link_tags
            if "alternate" in attributes.get("rel", "").lower().split()
            and attributes.get("type") == "application/rss+xml"
        ]
        self.assertEqual(1, len(rss_links))
        rss_url = split_url(rss_links[0])
        self.assertTrue(is_local_http_url(rss_url))
        self.assertEqual("/feed.xml", rss_url.path)
        self.assertTrue((DIST / "feed.xml").is_file(), "The advertised RSS feed must exist.")

    def test_representative_pages_have_canonical_og_url(self):
        for page_name, expected_canonical in REPRESENTATIVE_METADATA_PAGES:
            with self.subTest(page=page_name):
                shell = parse_shell(read_page(page_name))
                canonical_urls = [
                    attributes.get("href")
                    for attributes in shell.link_tags
                    if "canonical" in attributes.get("rel", "").lower().split()
                ]
                self.assertEqual([expected_canonical], canonical_urls)
                og_urls = [
                    attributes.get("content")
                    for attributes in shell.meta_tags
                    if attributes.get("property", "").lower() == "og:url"
                ]
                self.assertEqual(
                    canonical_urls,
                    og_urls,
                    "Each page's og:url must equal its absolute canonical URL.",
                )

    def test_representative_pages_have_one_rss_alternate(self):
        for page_name, _ in REPRESENTATIVE_METADATA_PAGES:
            with self.subTest(page=page_name):
                shell = parse_shell(read_page(page_name))
                rss_links = [
                    attributes.get("href")
                    for attributes in shell.link_tags
                    if "alternate" in attributes.get("rel", "").lower().split()
                    and attributes.get("type") == "application/rss+xml"
                ]
                self.assertEqual(
                    1,
                    len(rss_links),
                    "Every page must expose exactly one RSS alternate link.",
                )
                rss_url = split_url(rss_links[0])
                self.assertTrue(is_local_http_url(rss_url))
                self.assertEqual("/feed.xml", rss_url.path)

    def test_footer_brand_and_working_rss_github_links(self):
        shell = parse_shell(read_page("index"))
        self.assertIn("Mind Keeper · AI 产品与工程实践", shell.footer_text)
        self.assertEqual(
            ["RSS", "GitHub"], [link["text"] for link in shell.footer_anchors]
        )
        rss, github = shell.footer_anchors
        self.assertEqual("/feed.xml", rss["attributes"].get("href"))
        self.assertTrue((DIST / "feed.xml").is_file(), "The footer RSS target must exist.")
        self.assertEqual("https://github.com/wangyuxiong", github["attributes"].get("href"))
        github_url = split_url(github["attributes"]["href"])
        self.assertEqual("https", github_url.scheme)
        self.assertEqual("github.com", github_url.hostname)
        self.assertTrue(github_url.path.strip("/"), "GitHub must link to a real profile path.")

    def test_homepage_title(self):
        self.assertEqual(
            "Mind Keeper | AI 产品与工程实践",
            parse_page("index").title,
            "Homepage <title> must use the personal-brand positioning.",
        )

    def test_homepage_contains_positioning_text(self):
        page = parse_page("index")
        self.assertTrue(
            POSITIONING_TEXT.replace(" ", "") in page.compact_text,
            "Homepage body must visibly contain the positioning text: " + POSITIONING_TEXT,
        )

    def test_homepage_contains_required_sections(self):
        homepage = read_page("index")
        sections = {
            section_id: parse_html(section(homepage, section_id))
            for section_id in HOMEPAGE_SECTION_IDS
        }
        for section_id, page in sections.items():
            with self.subTest(section=section_id, requirement="visible text"):
                self.assertTrue(
                    page.visible_text,
                    f"Homepage section id={section_id!r} must contain visible text.",
                )

        with self.subTest(section="learning-path", requirement="path title"):
            self.assertIn(
                LEARNING_PATH_TITLE.replace(" ", ""),
                sections["learning-path"].compact_text,
                "learning-path must contain its complete path title.",
            )
        for project_name in PROJECT_NAMES:
            with self.subTest(section="projects", project=project_name):
                self.assertIn(
                    project_name.replace(" ", ""),
                    sections["projects"].compact_text,
                    f"projects must contain the real project {project_name!r}.",
                )
        original_links = original_article_links(sections["original-articles"])
        latest_daily = sections["latest-daily"]
        self.assertTrue(
            original_links,
            "original-articles must contain at least one original article link.",
        )
        self.assertTrue(
            dated_daily_links(latest_daily),
            "latest-daily must contain at least one dated daily link.",
        )
        for section_id, hrefs in (
            ("original-articles", original_links),
            ("latest-daily", daily_links(latest_daily)),
        ):
            with self.subTest(section=section_id, requirement="meaningful links"):
                errors = homepage_article_link_errors(sections[section_id], hrefs)
                self.assertFalse(
                    errors,
                    f"Homepage section {section_id!r} has unusable article links: "
                    + repr(errors),
                )

    def test_homepage_sections_follow_content_order(self):
        homepage = read_page("index")
        section_id_pattern = re.compile(
            r"\bid\s*=\s*([\"'])("
            + "|".join(HOMEPAGE_SECTION_IDS)
            + r")\1"
        )
        actual_order = [
            match.group(2) for match in section_id_pattern.finditer(homepage)
        ]
        self.assertEqual(
            list(HOMEPAGE_SECTION_IDS),
            actual_order,
            "Homepage sections must follow the learning, projects, original, daily order.",
        )

    def test_original_articles_exclude_daily_links(self):
        original_articles = section(read_page("index"), "original-articles")
        links = daily_links(parse_html(original_articles))
        self.assertFalse(
            links,
            "original-articles must contain only original articles; found daily links: "
            + repr(links),
        )

    def test_latest_daily_contains_daily_links(self):
        latest_daily = parse_html(section(read_page("index"), "latest-daily"))
        self.assertTrue(
            dated_daily_links(latest_daily),
            "latest-daily must link to at least one dated /blog/ai-daily- or "
            "/blog/ai-hot-daily- page.",
        )
        errors = homepage_article_link_errors(latest_daily, daily_links(latest_daily))
        self.assertFalse(
            errors,
            "latest-daily must use visible links to generated articles: " + repr(errors),
        )

    def test_latest_daily_contains_automation_label(self):
        latest_daily = parse_html(section(read_page("index"), "latest-daily"))
        self.assertTrue(
            "自动整理" in latest_daily.compact_text,
            "latest-daily must visibly label the daily reports as '自动整理'.",
        )

    def test_blog_excludes_daily_links(self):
        links = daily_links(parse_page("blog"))
        self.assertFalse(
            links,
            "/blog must not contain daily-report links; found: " + repr(links),
        )

    def test_blog_excludes_hello_world_link(self):
        links = [
            href for href in parse_page("blog").links if is_hello_world_url(href)
        ]
        self.assertFalse(links, f"/blog must not link to the draft hello-world post: {links}")

    def test_post_lists_preserve_iso_calendar_dates(self):
        cases = (
            ("blog", "2026年5月7日"),
            ("daily", "2026年11月5日"),
        )
        for page_name, expected_date in cases:
            with self.subTest(page=page_name, date=expected_date):
                self.assertIn(
                    expected_date,
                    parse_page(page_name).compact_text,
                    f"{page_name} must render the source ISO calendar date without "
                    "shifting it to the local timezone's previous day.",
                )

    def test_daily_still_contains_daily_links(self):
        self.assertTrue(
            dated_daily_links(parse_page("daily")),
            "/daily must retain dated /blog/ai-daily- or /blog/ai-hot-daily- links.",
        )

    def test_daily_has_real_latest_update_label(self):
        page = parse_page("daily")
        links = dated_daily_links(page)
        self.assertTrue(links, "/daily needs daily links before its latest update can be checked.")

        match = LATEST_UPDATE_RE.search(page.visible_text)
        self.assertIsNotNone(
            match,
            "/daily must show a latest-update label with a real date, "
            "for example '最近更新：2026-11-05'; generic '每日更新' is insufficient.",
        )
        labelled_date_text = (
            f"{int(match.group(1)):04d}-{int(match.group(2)):02d}-"
            f"{int(match.group(3)):02d}"
        )
        try:
            labelled_date = datetime.date.fromisoformat(labelled_date_text)
            dated_links = [
                (href, datetime.date.fromisoformat(date_text))
                for href, date_text in links
            ]
        except ValueError as error:
            self.fail(f"/daily must use real ISO calendar dates: {error}")
        newest_daily_date = max(date for _, date in dated_links)
        self.assertEqual(
            newest_daily_date,
            labelled_date,
            "The latest-update label must match the newest daily link on /daily.",
        )

    def test_portfolio_contains_both_real_projects(self):
        text = parse_page("portfolio").compact_text
        for project_name in ("文心启航", "Mind Keeper 日报系统"):
            with self.subTest(project=project_name):
                self.assertTrue(
                    project_name.replace(" ", "") in text,
                    f"/portfolio must contain the real project {project_name!r}.",
                )

    def test_writing_coach_contains_no_example_domain(self):
        self.assertFalse(
            "example.com" in read_page("portfolio/writing-coach").lower(),
            "Writing Coach must not contain example.com placeholder URLs or contacts.",
        )

    def test_writing_coach_contains_no_fake_writing_examples(self):
        text = parse_page("portfolio/writing-coach").compact_text
        for example in FAKE_WRITING_EXAMPLES:
            with self.subTest(example=example[:20]):
                self.assertFalse(
                    example in text,
                    "Writing Coach must remove the fabricated writing example: " + example,
                )

    def test_writing_coach_download_controls_are_real_links(self):
        controls = parse_page("portfolio/writing-coach").download_controls
        for tag, href, label in controls:
            with self.subTest(control=label):
                error = download_control_error(tag, href, "portfolio/writing-coach")
                self.assertIsNone(error, f"Download control {label!r} {error}.")

    def test_about_contains_positioning_text(self):
        page = parse_page("about")
        self.assertTrue(
            POSITIONING_TEXT.replace(" ", "") in page.compact_text,
            "About page body must visibly contain the positioning text: " + POSITIONING_TEXT,
        )

    def test_about_contains_no_skill_percentages(self):
        page = parse_page("about")
        percentages = [
            match.group(0) for match in SKILL_PERCENTAGE_RE.finditer(page.visible_text)
        ]
        percentages.extend(page.level_percentages)
        self.assertFalse(
            percentages,
            "/about must not present legacy skill labels or level bars as numeric "
            f"percentages; found {percentages}.",
        )

    def test_public_html_contains_no_hash_links(self):
        files = public_html_files()
        self.assertTrue(files, "No public HTML files found under dist/.")
        for path in files:
            page = parse_html(path.read_text(encoding="utf-8"))
            relative_path = path.relative_to(DIST)
            with self.subTest(file=str(relative_path)):
                self.assertFalse(
                    page.hash_links,
                    f"{relative_path} contains dead href=\"#\" links: {page.hash_links}",
                )

    def test_public_html_contains_no_placeholder_contact(self):
        files = public_html_files()
        self.assertTrue(files, "No public HTML files found under dist/.")
        for path in files:
            html = path.read_text(encoding="utf-8")
            relative_path = path.relative_to(DIST)
            with self.subTest(file=str(relative_path)):
                self.assertFalse(
                    "contact@example.com" in html.lower(),
                    f"{relative_path} contains the placeholder contact contact@example.com.",
                )

    def test_public_html_contains_no_hello_world_public_urls(self):
        files = public_html_files()
        self.assertTrue(files, "No public HTML files found under dist/.")
        for path in files:
            page = parse_html(path.read_text(encoding="utf-8"))
            urls = [url for url in page.public_urls if is_hello_world_url(url)]
            relative_path = path.relative_to(DIST)
            with self.subTest(file=str(relative_path)):
                self.assertFalse(
                    urls,
                    f"{relative_path} exposes public hello-world URLs: {urls}",
                )

    def test_hello_world_html_is_not_generated(self):
        path = DIST / "blog" / "hello-world.html"
        self.assertFalse(
            path.exists(),
            "The hello-world draft must not have a generated dist/blog/hello-world.html file.",
        )

    def test_sitemap_excludes_hello_world(self):
        path = DIST / "sitemap.xml"
        try:
            sitemap = path.read_text(encoding="utf-8")
        except FileNotFoundError:
            self.fail("Missing dist/sitemap.xml. Run 'pnpm build' before 'pnpm test:brand'.")
        self.assertFalse(
            "hello-world" in sitemap,
            "Sitemap must exclude the hello-world post after it becomes a draft.",
        )


class BrandSiteHarnessTests(unittest.TestCase):
    """Exercise acceptance boundaries with small, isolated dist fixtures."""

    @staticmethod
    def homepage_html(overrides=None):
        contents = {
            "learning-path": "<h2>AI Agent：从入门到做出第一个工具</h2>",
            "projects": "<h2>代表作品</h2><p>文心启航</p><p>Mind Keeper 日报系统</p>",
            "original-articles": (
                '<h2>最新原创</h2><a href="/blog/agent-basics">Agent 入门</a>'
            ),
            "latest-daily": (
                "<h2>最新 AI 日报</h2><p>自动整理</p>"
                '<a href="/blog/ai-daily-2026-11-05">2026-11-05 日报</a>'
            ),
        }
        if overrides:
            contents.update(overrides)
        return "".join(
            f'<section id="{section_id}">{contents[section_id]}</section>'
            for section_id in (
                "learning-path",
                "projects",
                "original-articles",
                "latest-daily",
            )
        )

    def homepage_files(self, overrides=None):
        return {
            "index.html": self.homepage_html(overrides),
            "blog/agent-basics.html": "original article fixture",
            "blog/ai-daily-2026-11-05.html": "daily article fixture",
        }

    def run_acceptance(self, test_name, files):
        with tempfile.TemporaryDirectory() as directory:
            dist = Path(directory)
            for name, content in files.items():
                path = dist / name
                path.parent.mkdir(parents=True, exist_ok=True)
                path.write_text(content, encoding="utf-8")
            with mock.patch.dict(globals(), {"DIST": dist}):
                test = BrandSiteAcceptanceTests(test_name)
                getattr(test, test_name)()

    def assert_rejected(self, test_name, files):
        with self.assertRaises(AssertionError):
            self.run_acceptance(test_name, files)

    def test_daily_prefix_variants_are_rejected_in_both_original_sections(self):
        hrefs = (
            "/blog/ai-daily-",
            "/blog/ai-daily-draft",
            "/blog/ai-daily-draft/nested",
            "/blog/ai-daily-2026-11-05/nested",
            "https://mind-keeper.com/blog/ai-daily-draft",
        )
        pages = {
            "test_original_articles_exclude_daily_links": (
                "index.html",
                '<section id="original-articles"><a href="{}">daily</a></section>'
                '<section id="latest-daily"></section>',
            ),
            "test_blog_excludes_daily_links": ("blog.html", '<a href="{}">daily</a>'),
        }
        for href in hrefs:
            for test_name, (filename, template) in pages.items():
                with self.subTest(href=href, test=test_name):
                    self.assert_rejected(test_name, {filename: template.format(href)})

    def test_legacy_daily_slug_cannot_count_as_original_or_remain_in_blog(self):
        legacy_href = "/blog/ai-hot-daily-2026-05-25"
        original_files = self.homepage_files(
            {
                "original-articles": (
                    "<h2>最新原创</h2>"
                    f'<a href="{legacy_href}">旧日报不能冒充原创</a>'
                )
            }
        )
        original_files["blog/ai-hot-daily-2026-05-25.html"] = "legacy daily"
        cases = (
            (
                "original section exclusion",
                "test_original_articles_exclude_daily_links",
                {
                    "index.html": (
                        '<section id="original-articles">'
                        '<a href="/blog/agent-basics">原创</a>'
                        f'<a href="{legacy_href}">旧日报</a>'
                        "</section>"
                    )
                },
            ),
            (
                "blog exclusion",
                "test_blog_excludes_daily_links",
                {"blog.html": f'<a href="{legacy_href}">旧日报</a>'},
            ),
            (
                "original link presence",
                "test_homepage_contains_required_sections",
                original_files,
            ),
        )
        for label, test_name, files in cases:
            with self.subTest(requirement=label):
                self.assert_rejected(test_name, files)

    def test_legacy_daily_slug_supports_latest_links_and_dates(self):
        legacy_href = "/blog/ai-hot-daily-2026-05-25"
        legacy_link = f'<a href="{legacy_href}">2026-05-25 旧日报</a>'
        homepage_files = self.homepage_files(
            {
                "latest-daily": (
                    "<h2>最新 AI 日报</h2><p>自动整理</p>" + legacy_link
                )
            }
        )
        homepage_files["blog/ai-hot-daily-2026-05-25.html"] = "legacy daily"
        cases = (
            (
                "homepage required sections",
                "test_homepage_contains_required_sections",
                homepage_files,
            ),
            (
                "latest daily",
                "test_latest_daily_contains_daily_links",
                {
                    "index.html": (
                        '<section id="latest-daily">' + legacy_link + "</section>"
                    ),
                    "blog/ai-hot-daily-2026-05-25.html": "legacy daily",
                },
            ),
            (
                "daily archive",
                "test_daily_still_contains_daily_links",
                {"daily.html": legacy_link},
            ),
            (
                "latest update date",
                "test_daily_has_real_latest_update_label",
                {"daily.html": "<p>最近更新：2026-05-25</p>" + legacy_link},
            ),
        )
        for label, test_name, files in cases:
            with self.subTest(requirement=label):
                self.run_acceptance(test_name, files)

    def test_aihot_external_urls_are_not_classified_as_local_daily_links(self):
        hrefs = (
            "https://aihot.news/items/hkcafk9es55rbok8pinu90x5o",
            "https://aihot.news/blog/ai-daily-draft",
        )
        for href in hrefs:
            with self.subTest(href=href):
                self.run_acceptance(
                    "test_blog_excludes_daily_links",
                    {"blog.html": f'<a href="{href}">AIHOT 条目</a>'},
                )

    def test_homepage_required_sections_reject_empty_containers(self):
        for section_id in (
            "learning-path",
            "projects",
            "original-articles",
            "latest-daily",
        ):
            with self.subTest(section=section_id):
                self.assert_rejected(
                    "test_homepage_contains_required_sections",
                    self.homepage_files({section_id: ""}),
                )

    def test_homepage_required_sections_check_their_own_content(self):
        self.run_acceptance(
            "test_homepage_contains_required_sections",
            self.homepage_files(),
        )
        incomplete_sections = {
            "learning-path": "<h2>从这里开始</h2><p>后续更新</p>",
            "projects": "<h2>代表作品</h2><p>文心启航</p>",
            "original-articles": (
                "<h2>最新原创</h2>"
                '<a href="/blog/ai-daily-2026-11-05">日报不能冒充原创</a>'
            ),
            "latest-daily": "<h2>最新 AI 日报</h2><p>自动整理</p>",
        }
        for section_id, content in incomplete_sections.items():
            with self.subTest(section=section_id):
                self.assert_rejected(
                    "test_homepage_contains_required_sections",
                    self.homepage_files({section_id: content}),
                )

    def test_homepage_article_links_require_text_and_existing_targets(self):
        self.run_acceptance(
            "test_homepage_contains_required_sections",
            self.homepage_files(),
        )
        cases = {
            "empty original anchor": {
                "original-articles": (
                    '<h2>最新原创</h2><a href="/blog/agent-basics"></a>'
                )
            },
            "dead original anchor": {
                "original-articles": (
                    '<h2>最新原创</h2><a href="/blog/missing">不存在的原创</a>'
                )
            },
            "empty dead original anchor": {
                "original-articles": (
                    '<h2>最新原创</h2><a href="/blog/missing"></a>'
                )
            },
            "empty daily anchor": {
                "latest-daily": (
                    "<h2>最新 AI 日报</h2><p>自动整理</p>"
                    '<a href="/blog/ai-daily-2026-11-05"></a>'
                )
            },
            "dead daily anchor": {
                "latest-daily": (
                    "<h2>最新 AI 日报</h2><p>自动整理</p>"
                    '<a href="/blog/ai-daily-2026-11-04">不存在的日报</a>'
                )
            },
        }
        for label, overrides in cases.items():
            with self.subTest(case=label):
                self.assert_rejected(
                    "test_homepage_contains_required_sections",
                    self.homepage_files(overrides),
                )

    def test_homepage_daily_links_reject_impossible_calendar_dates(self):
        invalid_href = "/blog/ai-daily-2026-02-30"
        overrides = {
            "latest-daily": (
                "<h2>最新 AI 日报</h2><p>自动整理</p>"
                f'<a href="{invalid_href}">2026-02-30 日报</a>'
            )
        }
        cases = (
            (
                "required sections",
                "test_homepage_contains_required_sections",
                self.homepage_files(overrides),
            ),
            (
                "latest daily",
                "test_latest_daily_contains_daily_links",
                {
                    "index.html": (
                        '<section id="latest-daily">'
                        f'<a href="{invalid_href}">2026-02-30 日报</a>'
                        "</section>"
                    )
                },
            ),
        )
        for label, test_name, files in cases:
            with self.subTest(requirement=label):
                self.assert_rejected(test_name, files)

    def test_homepage_section_order_is_validated_separately(self):
        self.run_acceptance(
            "test_homepage_sections_follow_content_order",
            {"index.html": self.homepage_html()},
        )
        self.assert_rejected(
            "test_homepage_sections_follow_content_order",
            {
                "index.html": (
                    "<section id=\"projects\">文心启航 Mind Keeper 日报系统</section>"
                    "<section id=\"learning-path\">AI Agent：从入门到做出第一个工具</section>"
                    '<section id="original-articles">'
                    '<a href="/blog/agent-basics">原创</a></section>'
                    '<section id="latest-daily">'
                    '<a href="/blog/ai-daily-2026-11-05">日报</a></section>'
                )
            },
        )

    def test_original_articles_daily_links_cannot_hide_after_nested_boundary(self):
        self.assert_rejected(
            "test_original_articles_exclude_daily_links",
            {
                "index.html": (
                    '<section id="original-articles">'
                    '<a href="/blog/agent-basics">原创</a>'
                    '<div><section id="latest-daily">嵌套边界</section></div>'
                    '<a href="/blog/ai-daily-2026-11-05">日报</a>'
                    "</section>"
                )
            },
        )

    def test_section_extraction_does_not_use_following_sibling_daily_links(self):
        self.assert_rejected(
            "test_latest_daily_contains_daily_links",
            {
                "index.html": (
                    '<section id="latest-daily">自动整理</section>'
                    '<section id="following-sibling">'
                    '<a href="/blog/ai-daily-2026-11-05">日报</a>'
                    "</section>"
                )
            },
        )
        self.run_acceptance(
            "test_original_articles_exclude_daily_links",
            {
                "index.html": (
                    '<section id="original-articles">'
                    '<a href="/blog/agent-basics">原创</a>'
                    "</section>"
                    '<section id="latest-daily">'
                    '<a href="/blog/ai-daily-2026-11-05">日报</a>'
                    "</section>"
                )
            },
        )

    def test_download_ctas_reject_dead_actions_and_missing_local_files(self):
        controls = (
            "<button>免费下载</button>",
            "<a>免费下载</a>",
            '<a href="">免费下载</a>',
            '<a href="#">免费下载</a>',
            '<a href="#download">免费下载</a>',
            '<a href="JavaScript:void(0)">免费下载</a>',
            '<a href="/downloads/missing.zip">免费下载</a>',
        )
        for control in controls:
            with self.subTest(control=control):
                self.assert_rejected(
                    "test_writing_coach_download_controls_are_real_links",
                    {"portfolio/writing-coach.html": control},
                )

    def test_download_ctas_accept_existing_local_files(self):
        self.run_acceptance(
            "test_writing_coach_download_controls_are_real_links",
            {
                "portfolio/writing-coach.html": (
                    '<a href="/downloads/writing-coach.zip">下载安装包</a>'
                    '<a href="https://mind-keeper.com/downloads/writing-coach.zip">本站镜像</a>'
                ),
                "downloads/writing-coach.zip": "local fixture",
            },
        )

    def test_download_ctas_reject_unverified_writing_coach_releases_url(self):
        self.assert_rejected(
            "test_writing_coach_download_controls_are_real_links",
            {
                "portfolio/writing-coach.html": (
                    '<a href="https://github.com/wangyuxiong/writing-coach/releases">'
                    "下载试用</a>"
                )
            },
        )

    def test_download_ctas_reject_root_only_external_urls_even_when_allowlisted(self):
        for href in ("https://example.com", "https://example.com/"):
            with self.subTest(href=href):
                with mock.patch.dict(
                    globals(), {"VERIFIED_EXTERNAL_DOWNLOADS": {href}}
                ):
                    self.assert_rejected(
                        "test_writing_coach_download_controls_are_real_links",
                        {
                            "portfolio/writing-coach.html": (
                                f'<a href="{href}">下载试用</a>'
                            )
                        },
                    )

    def test_download_ctas_accept_temporarily_allowlisted_external_file(self):
        href = "https://downloads.example.com/releases/writing-coach.zip"
        with mock.patch.dict(globals(), {"VERIFIED_EXTERNAL_DOWNLOADS": {href}}):
            self.run_acceptance(
                "test_writing_coach_download_controls_are_real_links",
                {
                    "portfolio/writing-coach.html": (
                        f'<a href="{href}">下载已验证安装包</a>'
                    )
                },
            )

    def test_about_rejects_legacy_skill_labels_and_level_bars(self):
        skill_labels = (
            "React / Next.js",
            "TypeScript",
            "Node.js",
            "AI 工作流 / Agent",
            "AI workflow",
            "内容创作",
            "content creation",
            "SEO / 营销",
        )
        for label in skill_labels:
            with self.subTest(label=label):
                self.assert_rejected(
                    "test_about_contains_no_skill_percentages",
                    {"about.html": f"<span>{label}</span><span>85%</span>"},
                )
        level_bars = (
            '<div class="skill-level" style="width: 85%"></div>',
            '<div data-level="85" aria-valuemax="100"></div>',
            '<div class="skill-bar" style="width: 85%"></div>',
            '<div class="progress" style="width: 80%"></div>',
            '<div role="progressbar" aria-valuenow="75" aria-valuemax="100"></div>',
            '<progress value="85" max="100">85%</progress>',
        )
        for bar in level_bars:
            with self.subTest(bar=bar):
                self.assert_rejected(
                    "test_about_contains_no_skill_percentages", {"about.html": bar}
                )

    def test_about_rejects_nested_skill_bar_percentage_children(self):
        self.assert_rejected(
            "test_about_contains_no_skill_percentages",
            {
                "about.html": (
                    '<div class="skill-bar">'
                    '<span style="width:85%"></span>'
                    "</div>"
                )
            },
        )

    def test_about_allows_unrelated_percentage_prose(self):
        self.run_acceptance(
            "test_about_contains_no_skill_percentages",
            {
                "about.html": (
                    "<p>100% 原创；内容创作 100% 原创；85% 的引用经过人工复核。</p>"
                )
            },
        )

    def test_daily_rejects_impossible_latest_update_dates(self):
        for invalid_date in ("2026-99-99", "2026-02-30"):
            with self.subTest(date=invalid_date):
                self.assert_rejected(
                    "test_daily_has_real_latest_update_label",
                    {
                        "daily.html": (
                            f"<p>最近更新：{invalid_date}</p>"
                            f'<a href="/blog/ai-daily-{invalid_date}">日报</a>'
                        )
                    },
                )

    def test_latest_update_rejects_date_with_trailing_digit(self):
        valid_link = '<a href="/blog/ai-daily-2026-11-05">2026-11-05 日报</a>'
        self.run_acceptance(
            "test_daily_has_real_latest_update_label",
            {"daily.html": "<p>最近更新：2026-11-05</p>" + valid_link},
        )
        self.assert_rejected(
            "test_daily_has_real_latest_update_label",
            {"daily.html": "<p>最近更新：2026-11-050</p>" + valid_link},
        )

    def test_malformed_urls_become_assertion_failures(self):
        cases = (
            "test_blog_excludes_daily_links",
            "test_blog_excludes_hello_world_link",
            "test_public_html_contains_no_hello_world_public_urls",
        )
        for test_name in cases:
            for href in ("http://[::1", "https://example.com:bad/blog/hello-world"):
                with self.subTest(test=test_name, href=href):
                    try:
                        self.assert_rejected(
                            test_name,
                            {"blog.html": f'<a href="{href}">malformed</a>'},
                        )
                    except ValueError as error:
                        self.fail(
                            "URL parsing escaped as ValueError instead of assertion: "
                            f"{error}"
                        )

    def test_hello_world_checks_only_reject_local_urls(self):
        for test_name in (
            "test_blog_excludes_hello_world_link",
            "test_public_html_contains_no_hello_world_public_urls",
        ):
            with self.subTest(test=test_name, kind="external citation"):
                self.run_acceptance(
                    test_name,
                    {
                        "blog.html": (
                            '<a href="https://example.com/blog/hello-world">外部引用</a>'
                        )
                    },
                )
            for href in (
                "/blog/hello-world",
                "https://mind-keeper.com/blog/hello-world",
                "https://mind-keeper.com./blog/hello-world",
                "//mind-keeper.com/blog/hello-world",
            ):
                with self.subTest(test=test_name, href=href):
                    self.assert_rejected(
                        test_name,
                        {"blog.html": f'<a href="{href}">草稿</a>'},
                    )

    def test_hello_world_generated_file_is_rejected_directly(self):
        self.run_acceptance(
            "test_hello_world_html_is_not_generated",
            {"blog/agent-basics.html": "published original"},
        )
        self.assert_rejected(
            "test_hello_world_html_is_not_generated",
            {"blog/hello-world.html": "public draft"},
        )

    def test_missing_page_diagnostic_supports_temporary_dist(self):
        try:
            self.run_acceptance("test_homepage_title", {})
        except AssertionError as error:
            self.assertIn("Missing generated page:", str(error))
            self.assertIn("index.html", str(error))
        except ValueError as error:
            self.fail(f"Missing-page diagnostic raised ValueError: {error}")
        else:
            self.fail("A missing homepage must fail acceptance.")


if __name__ == "__main__":
    unittest.main()
