#!/usr/bin/env python3
"""Static acceptance tests for the Mind Keeper personal brand site."""

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
DAILY_PATH_PREFIX = "/blog/ai-daily-"
DAILY_DATE_RE = re.compile(r"^/blog/ai-daily-(\d{4}-\d{2}-\d{2})(?:/|$)")
LATEST_UPDATE_RE = re.compile(
    r"(?:最近|最新|最后)\s*更新\s*[：:]?\s*"
    r"(\d{4})\s*(?:-|/|\.|年)\s*(\d{1,2})\s*(?:-|/|\.|月)\s*(\d{1,2})\s*日?"
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
        raise AssertionError(
            f"Missing generated page: {path.relative_to(ROOT)}. "
            "Run 'pnpm build' before 'pnpm test:brand'."
        ) from None


class _SectionParser(HTMLParser):
    def __init__(self, html, start_id, end_id):
        super().__init__(convert_charrefs=True)
        self.html = html
        self.start_id = start_id
        self.end_id = end_id
        self.line_offsets = [0]
        self.line_offsets.extend(match.end() for match in re.finditer("\n", html))
        self.start = None
        self.end = None
        self.root_tag = None
        self.depth = 0
        self.found_end_id = False

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

        if self.end_id is not None:
            if element_id == self.end_id:
                self.end = offset
                self.found_end_id = True
        elif tag == self.root_tag:
            self.depth += 1

    def handle_endtag(self, tag):
        if (
            self.end_id is None
            and self.start is not None
            and self.end is None
            and tag == self.root_tag
        ):
            self.depth -= 1
            if self.depth == 0:
                self.end = self.current_offset()


def section(html, start_id, end_id=None):
    """Return HTML from an element id to its close or the next boundary id."""
    parser = _SectionParser(html, start_id, end_id)
    parser.feed(html)
    parser.close()

    if parser.start is None:
        raise AssertionError(f"Missing required section id={start_id!r}.")
    if end_id is not None and not parser.found_end_id:
        raise AssertionError(
            f"Section id={start_id!r} has no following boundary id={end_id!r}."
        )
    if parser.end is None:
        raise AssertionError(f"Section id={start_id!r} has no closing </{parser.root_tag}>.")

    return html[parser.start : parser.end]


class _PageParser(HTMLParser):
    """Inspect rendered HTML without interpreting inline or external JavaScript."""

    def __init__(self):
        super().__init__(convert_charrefs=True)
        self._hidden_depth = 0
        self._in_title = False
        self._title_chunks = []
        self._text_chunks = []
        self._control = None
        self.links = []
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
            re.search(r"(?:^|\s)level(?:$|\s)", level_name, re.IGNORECASE)
            is not None
            or "data-level" in attrs
        )
        if is_level_bar:
            for attribute in ("style", "data-level", "aria-valuenow", "aria-valuetext"):
                value = (attrs.get(attribute) or "").strip()
                percentage = PERCENT_RE.search(value)
                numeric_level = (
                    attribute in {"data-level", "aria-valuenow"}
                    and re.fullmatch(r"(?:\d{1,2}|100)(?:\.0+)?", value)
                    and (attribute == "data-level" or attrs.get("aria-valuemax") == "100")
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
            self._control = (tag, attrs.get("href"), [])

    def handle_endtag(self, tag):
        if self._control is not None and tag == self._control[0]:
            control_tag, href, chunks = self._control
            label = " ".join("".join(chunks).split())
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


def parse_html(html):
    parser = _PageParser()
    parser.feed(html)
    parser.close()
    return parser


def parse_page(name):
    return parse_html(read_page(name))


def daily_links(page):
    """Return local links under the daily path, regardless of their suffix."""
    matches = []
    for href in page.links:
        parts = urlsplit(href)
        if parts.scheme and parts.scheme not in {"http", "https"}:
            continue
        if parts.netloc and parts.hostname != SITE_HOST:
            continue
        if parts.path.startswith(DAILY_PATH_PREFIX):
            matches.append(href)
    return matches


def dated_daily_links(page):
    """Return local daily links with a date usable for latest-update checks."""
    matches = []
    for href in daily_links(page):
        match = DAILY_DATE_RE.match(urlsplit(href).path)
        if match:
            matches.append((href, match.group(1)))
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
    except ValueError:
        return f"has an invalid URL: {href!r}"

    if parts.scheme not in {"", "http", "https"}:
        return f"must use an HTTP(S) or local URL, got {href!r}"
    if parts.scheme and not parts.netloc:
        return f"has an invalid absolute URL: {href!r}"
    if parts.netloc and hostname != SITE_HOST:
        # Offline static tests cannot verify remote release artifacts.
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
    path = urlsplit(url).path
    return re.search(r"(?:^|/)hello-world(?:\.html)?/?$", path) is not None


def public_html_files():
    if not DIST.is_dir():
        raise AssertionError("Missing dist/. Run 'pnpm build' before 'pnpm test:brand'.")
    return sorted(
        path
        for path in DIST.rglob("*.html")
        if "_next" not in path.relative_to(DIST).parts
    )


class BrandSiteAcceptanceTests(unittest.TestCase):
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
        for section_id in ("learning-path", "projects", "original-articles", "latest-daily"):
            with self.subTest(section=section_id):
                self.assertTrue(
                    section(homepage, section_id),
                    f"Homepage must contain a non-empty section id={section_id!r}.",
                )

    def test_original_articles_exclude_daily_links(self):
        original_articles = section(
            read_page("index"), "original-articles", "latest-daily"
        )
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
            "latest-daily must link to at least one /blog/ai-daily-YYYY-MM-DD page.",
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

    def test_daily_still_contains_daily_links(self):
        self.assertTrue(
            dated_daily_links(parse_page("daily")),
            "/daily must retain links to /blog/ai-daily-YYYY-MM-DD pages.",
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
        labelled_date = f"{int(match.group(1)):04d}-{int(match.group(2)):02d}-{int(match.group(3)):02d}"
        newest_daily_date = max(date for _, date in links)
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

    def run_acceptance(self, test_name, files):
        with tempfile.TemporaryDirectory() as directory:
            dist = Path(directory)
            for name, content in files.items():
                path = dist / name
                path.parent.mkdir(parents=True, exist_ok=True)
                path.write_text(content, encoding="utf-8")
            with mock.patch(f"{__name__}.DIST", dist):
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

    def test_download_ctas_accept_existing_local_and_absolute_external_files(self):
        self.run_acceptance(
            "test_writing_coach_download_controls_are_real_links",
            {
                "portfolio/writing-coach.html": (
                    '<a href="/downloads/writing-coach.zip">下载安装包</a>'
                    '<a href="https://example.com/releases/writing-coach.zip">下载镜像</a>'
                ),
                "downloads/writing-coach.zip": "local fixture",
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
        )
        for bar in level_bars:
            with self.subTest(bar=bar):
                self.assert_rejected(
                    "test_about_contains_no_skill_percentages", {"about.html": bar}
                )

    def test_about_allows_unrelated_percentage_prose_and_progress(self):
        self.run_acceptance(
            "test_about_contains_no_skill_percentages",
            {
                "about.html": (
                    "<p>100% 原创；内容创作 100% 原创；85% 的引用经过人工复核。</p>"
                    '<div class="progress" style="width: 80%"></div>'
                )
            },
        )


if __name__ == "__main__":
    unittest.main()
