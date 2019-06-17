'use strict';

const Hoek = require('hoek');
const Schmervice = require('schmervice');

module.exports = class PuppetService extends Schmervice.Service {

    async getText(page, selector) {

        return await page.$eval(selector, (el) => el.innerText);
    }
};
