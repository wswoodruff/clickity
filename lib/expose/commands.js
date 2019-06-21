'use strict';

const internals = {};

module.exports = (server, options) => ({
    value: {
        xrpPrice: async (srv, args) => {

            const { puppetService } = srv.services();

            const page = await puppetService.getPage();
            await puppetService.goto(page, 'https://coinmarketcap.com/currencies/ripple');

            console.log(await puppetService.getText(page, '.details-panel-item--price__value'));
        }
    }
});
