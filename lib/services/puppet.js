'use strict';

const Puppeteer = require('puppeteer');
const Schmervice = require('schmervice');

const internals = {};

module.exports = class PuppetService extends Schmervice.Service {

    async initialize() {

        this.browser = await Puppeteer.launch({
            // Pipe the browser process stdout and stderr
            // into process.stdout and process.stderr.
            // Defaults to false.
            // dumpio: true
        });

        this.pages = {};
    }

    async teardown() {

        await this.browser.close();
    }

    async getPage() {

        // What if I made an autoclose mode where I monkeypatched
        // every func a page has to debounce a func that checks to see if the page
        // is closed or not, and close it after a set amount of time maybe

        const browserPage = await this.browser.newPage();

        browserPage.getElement = browserPage.$;
        browserPage.getElements = browserPage.$$;
        browserPage.evalHandle = this.evalHandle.bind(this, browserPage);
        browserPage.tableToJson = this.tableToJson.bind(this, browserPage);
        browserPage.id = Date.now();

        this.pages[browserPage.id] = browserPage;

        return browserPage;
    }

    listPages() {

        return this.pages;
    }

    // Intended to evaluate an ElementHandle
    async evalHandle(page, elHandle, props) {

        return await page.evaluate((el) => {

            return [].concat(props).map((prop) => {

                const isFunc = prop.slice(-2) === '()';

                return isFunc ? el[prop.slice(0, -2)]() : el[prop];
            });
        }, elHandle);
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
