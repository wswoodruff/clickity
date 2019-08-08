# API Reference

## puppetService

#### getPage()
Get a new page reference

**IMPORTANT**
You will have a memory leak if you don't close the page you get from this func.

When you're finished, call `await page.close();`

#### goto(page, url)
Use an existing page to goto a url

#### getElement(page, selector)
Get first element for selector

#### getElements(page, selector)
Get all elements for selector

#### getHtml(page, selector)
Get `innerHTML` for selector

#### getText(page, selector)
Get `innerText` for selector
