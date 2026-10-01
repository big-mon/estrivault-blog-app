# Mobile footer ending

The former 136px bottom margin exposed only part of a 360px desktop lake SVG,
leaving an isolated blue water fragment and a hard vertical edge on mobile.
Mobile now ends in ivory at the footer. The existing top panorama remains, and
the decorative container is limited to its 176px height. Desktop scenery is unchanged.

These are actual mobile Chromium screenshots, captured at the document bottom,
with an 800px viewport height and reduced motion. Each includes the footer and
page end. Full-page captures are included for the 390px viewport.

| Page          | 320px                   | 360px                   | 390px                   | 430px                   | Full page, 390px             |
| ------------- | ----------------------- | ----------------------- | ----------------------- | ----------------------- | ---------------------------- |
| Homepage      | [View](home-320.png)    | [View](home-360.png)    | [View](home-390.png)    | [View](home-430.png)    | [View](home-390-full.png)    |
| Short archive | [View](short-320.png)   | [View](short-360.png)   | [View](short-390.png)   | [View](short-430.png)   | [View](short-390-full.png)   |
| Long article  | [View](article-320.png) | [View](article-360.png) | [View](article-390.png) | [View](article-430.png) | [View](article-390-full.png) |

The regression tests cover these widths and page lengths with normal and reduced
motion, scrolling from top to bottom, and viewport heights of 600, 1400 and 800px.
Resizing exercises changing viewport dimensions; it is not a physical-device
Safari/browser-toolbar test.
