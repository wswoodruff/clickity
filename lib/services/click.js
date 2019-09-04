'use strict';

const Puppeteer = require('puppeteer');
const Schmervice = require('schmervice');
const Uuid = require('uuid');
const Bounce = require('bounce');

const internals = {};

module.exports = class ClickService extends Schmervice.Service {

    async initialize() {

        this.browser = await Puppeteer.launch({
            devtools: this.options.devTools
            // Pipe the browser process stdout and stderr
            // into process.stdout and process.stderr.
            // Defaults to false.
            // It's pretty noisy so I don't mind
            // dumpio: true
        });

        // This was created so I can publish an event in one part
        // of my app, and grab a page and act on it in another part
        this.pages = {};
    }

    async teardown() {

        for (const pageId of Object.keys(this.pages)) {

            await this.closePage(this.pages[pageId]);
        }

        await this.browser.close();
    }

    async closePage(page) {

        try {
            await page.close();
        }
        catch (err) {

            Bounce.ignore(err, {
                message: 'Protocol error: Connection closed. Most likely the page has been closed.'
            });
        }
    }

    async getPage() {

        const browserPage = await this.browser.newPage();

        // Just some helpers that I like here
        browserPage.getElement = browserPage.$;
        browserPage.getElements = browserPage.$$;
        browserPage.eval = (...args) => this.eval(browserPage, ...args);
        browserPage.evalHandle = (...args) => this.evalHandle(browserPage, ...args);
        // browserPage.tableToJson = (...args) => this.tableToJson(browserPage, ...args);
        browserPage.id = Uuid.v4();

        this.pages[browserPage.id] = browserPage;

        return this.pages[browserPage.id];
    }

    getBrowser() {

        return this.browser;
    }

    getPages() {

        return this.pages;
    }

    getPagebyId(id) {

        return this.pages[id];
    }

    // Evaluate an element handle, (return value of page.$() or an item from page.$$())
    async evalHandle(page, elHandle, passedProps) {

        if (!elHandle) {
            throw new Error('elHandle no good (might be null)');
        }

        return await page.evaluate((el, props) => {

            const res = [].concat(props).map((prop) => {

                const isFunc = prop.slice(-2) === '()';

                return isFunc ? el[prop.slice(0, -2)]() : el[prop];
            });

            if (res.length === 1) {
                return res[0];
            }

            return res;
        }, elHandle, passedProps);
    }

    async eval(page, func, ...passedProps) {

        return await page.evaluate(func, ...passedProps);
    }

    async tableToJson(page, selector) {

        // Serializes the table into a string with rows separated by '\n',
        // cols separated by '\t'
        const tableInnerText = await this.evalHandle(page, page.$(selector), 'innerText');

        // Will take the first 2 columns in a table,
        // turning it into an object
        return tableInnerText.split('\n').slice(1).reduce((collector, pair) => {

            const [key, val] = pair.split('\t');
            collector[key] = val;

            return collector;
        }, {});
    }
};
