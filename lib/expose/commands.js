'use strict';

const Puppeteer = require('puppeteer');

const internals = {};

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

            await page.goto('https://coinmarketcap.com/currencies/ripple');
            const price = await puppetService.getText(page, '.details-panel-item--price__value');

            console.log('price', price);

            await browser.close();
        }
    }
});
