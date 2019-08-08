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
    }

    async teardown() {

        await this.browser.close();
    }

    async getPage() {

        return await this.browser.newPage();
    }

    async goto(page, url) {

        internals.assertPage(page);
        await page.goto(url);
        return page;
    }

    async getElement(page, selector) {

        return await page.$(selector);
    }

    async getElements(page, selector) {

        return await page.$$(selector);
    }

    async getHtml(page, selector) {

        internals.assertPage(page);
        return await page.$eval(selector, (el) => el.innerHTML);
    }

    async getText(page, selector) {

        internals.assertPage(page);
        return await page.$eval(selector, (el) => el.innerText);
    }

    async tableToJson(page, selector) {

        internals.assertPage(page);

        // Serializes the table into a string with rows separated by '\n',
        // cols separated by '\t'
        const tableInnerText = await this.getText(page, selector);

        // Will take the first 2 columns in a table,
        // turning it into an object
        return tableInnerText.split('\n').slice(1).reduce((collector, pair) => {

            const [key, val] = pair.split('\t');
            collector[key] = val;

            return collector;
        }, {});
    }
};

internals.assertPage = (page) => {

    if (!page) {
        throw new Error('"page" is required');
    }
};
