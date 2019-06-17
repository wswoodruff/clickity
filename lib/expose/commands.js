'use strict';

const Puppeteer = require('puppeteer');

const internals = {};

const URL = 'https://coinmarketcap.com/currencies/ripple';
const SELECTOR = '.details-panel-item--price__value';

module.exports = (server, options) => ({
    value: {
        xrpPrice: async (srv, args) => {

            const { puppetService } = srv.services();

            const browser = await Puppeteer.launch({
                // Pipe the browser process stdout and stderr
                // into process.stdout and process.stderr.
                // Defaults to false.
                // dumpio: true
            });

            const page = await browser.newPage();

            await page.goto(URL);
            const price = await puppetService.getText(page, SELECTOR);

            console.log('price', price);

            await browser.close();
        }
    }
});
