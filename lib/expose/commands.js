'use strict';

const internals = {};

module.exports = (server, options) => ({
    value: {
        loggerInner: async (srv, []) => {

            const url = 'https://ethereal.email/login';
            const messagesUrl = 'https://ethereal.email/messages';
            const usr = 'ryder.jerde14@ethereal.email';
            const pass = '94DtKFssqaDg7xryET';

            const { puppetService } = srv.services();

            const page = await puppetService.getPage();

            await page.goto(url);

            await page.type('input[type="email"]', usr);
            await page.type('input[type="password"]', pass);
            await page.click('button[type="submit"]', pass);

            await page.goto(messagesUrl);

            await page.screenshot({ path: 'mailbox.png', fullPage: true });

            await page.close();
        }
    }
});
