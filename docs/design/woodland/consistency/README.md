# Archive, palette and tablet ending review

Actual Chromium screenshots from the final build, with reduced motion enabled.
Mobile/tablet captures use mobile and touch emulation. Each bottom image is taken
after scrolling to the document end, including the footer.

| View                | Top                                | Bottom                                   |
| ------------------- | ---------------------------------- | ---------------------------------------- |
| Page 2, 390×844     | [Top](archive-mobile-top.png)      | [Bottom](archive-mobile-bottom.png)      |
| Category, 390×844   | [Top](category-mobile-top.png)     | [Bottom](category-mobile-bottom.png)     |
| Homepage, 768×1024  | [Top](home-tablet768-top.png)      | [Bottom](home-tablet768-bottom.png)      |
| Tag, 820×1180       | [Top](tag-tablet820-top.png)       | [Bottom](tag-tablet820-bottom.png)       |
| Category, 1024×768  | [Top](category-tablet1024-top.png) | [Bottom](category-tablet1024-bottom.png) |
| Article, 1024×768   | [Top](article-tablet1024-top.png)  | [Bottom](article-tablet1024-bottom.png)  |
| Page 2, 1440×1000   | [Top](archive-desktop-top.png)     | [Bottom](archive-desktop-bottom.png)     |
| Tag, 1440×1000      | [Top](tag-desktop-top.png)         | [Bottom](tag-desktop-bottom.png)         |
| Category, 1440×1000 | [Top](category-desktop-top.png)    | [Bottom](category-desktop-bottom.png)    |
| Notes, 820×1180     | [Top](notes-tablet820-top.png)     | [Bottom](notes-tablet820-bottom.png)     |

All lists now share the homepage masthead, post rows, category control and spacing.
Link colors are shared CSS tokens: normal #3e6249, hover/focus #24452f, visited
#4f6654. On ivory #fffdf2, normal/hover/visited text contrast is respectively
6.75:1, 10.46:1 and 6.12:1. Neutral titles and inverted filled controls retain
appropriate contrasting colors. Authored content, images and semantic errors
were not recolored.

Mobile/tablet scenery is restricted to the complete top panorama through 1100px.
The reading surface ends at the document bottom at every breakpoint, eliminating
the cropped water/green strip beneath it. The desktop side landscape remains.
