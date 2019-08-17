'use strict';

const Puppeteer = require('puppeteer');
const Schmervice = require('schmervice');
const Uuid = require('uuid');
const Bounce = require('bounce');

const internals = {};

module.exports = class ClickService extends Schmervice.Service {

    async initialize() {

        this.browser = await Puppeteer.launch({
            // Pipe the browser process stdout and stderr
            // into process.stdout and process.stderr.
            // Defaults to false.
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

        // What if I made an autoclose mode where I monkeypatched
        // every func a page has to debounce a func that checks to see if the page
        // is closed or not, and close it after a set amount of time maybe

        const browserPage = await this.browser.newPage();

        // Just some helpers that I like here
        browserPage.getElement = browserPage.$;
        browserPage.getElements = browserPage.$$;
        // browserPage.evalHandle = (...args) => this.evalHandle(browserPage, ...args);
        // browserPage.tableToJson = (...args) => this.tableToJson(browserPage, ...args);
        browserPage.id = Uuid.v4();

        this.pages[browserPage.id] = browserPage;

        return this.pages[browserPage.id];
    }

    getPagebyId(id) {

        return this.pages[id];
    }

    listPages() {

        return this.pages;
    }

    // TODO this is busted rn
    // Intended to evaluate an ElementHandle
    // async evalHandle(page, elHandle, props) {
    //
    //     return await page.evaluate(async (el) => {
    //
    //         return [].concat(props).map((prop) => {
    //
    //             const isFunc = prop.slice(-2) === '()';
    //
    //             return isFunc ? el[prop.slice(0, -2)]() : el[prop];
    //         });
    //     });
    // }

    // TODO this is busted til we fix evalHandle
    // async tableToJson(page, selector) {
    //
    //     // Serializes the table into a string with rows separated by '\n',
    //     // cols separated by '\t'
    //     const tableInnerText = await this.evalHandle(page, page.$(selector), 'innerText');
    //
    //     // Will take the first 2 columns in a table,
    //     // turning it into an object
    //     return tableInnerText.split('\n').slice(1).reduce((collector, pair) => {
    //
    //         const [key, val] = pair.split('\t');
    //         collector[key] = val;
    //
    //         return collector;
    //     }, {});
    // }
};
