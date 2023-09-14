import { By } from 'selenium-webdriver';
import Page from './Page';
import logger from '../../logger';
import { sleep } from '../../utils/time';
import { MEDIUM_TIME, SHORT_TIME, VERY_VERY_LONG_TIME } from '../../constants';

const TEXTS = {
    ApplyForVisa: 'Aufenthaltstitel - beantragen',
    ApplyForAsylumExtension: 'Aufenthaltsgestattung (Asyl) - verlängern',
    Employment: 'Erwerbstätigkeit',
    BlueCard: 'Blaue Karte EU',
    NoAppointments: 'keine Termine frei',
};

const DROPDOWN_NAMES = {
    Citizenship: 'sel_staat',
    NumberOfApplicants: 'personenAnzahl_normal',
    WithRelatives: 'lebnBrMitFmly',
};

const ELEMENTS = {
    Dropdown: {
        Citizenship: By.xpath(`//select[@name='${DROPDOWN_NAMES.Citizenship}']`),
        NumberOfApplicants: By.xpath(`//select[@name='${DROPDOWN_NAMES.NumberOfApplicants}']`),
        WithRelatives: By.xpath(`//select[@name='${DROPDOWN_NAMES.WithRelatives}']`),
    },
    Buttons: {
        ApplyForVisa: By.xpath(`//p[contains(text(), '${TEXTS.ApplyForVisa}')]`),
        Employment: By.xpath(`//p[contains(text(), '${TEXTS.Employment}')]`),
        BlueCard: By.xpath(`//label[contains(text(), '${TEXTS.BlueCard}')]`),
        Submit: By.id('applicationForm:managedForm:proceed'),
    },
    Boxes: {
        Messages: By.id('messagesBox'),
    },
    Errors: {
        NoAppointments: By.xpath(`//li[@class='errorMessage' and contains(text(), '${TEXTS.NoAppointments}')]`),
    },
};

class AppointmentPage extends Page {
    protected name = 'Appointment';

    // Appointment page is available once the citizenship dropdown is visible
    protected async doWaitUntilLoaded() {
        await this.bot.waitForElement(ELEMENTS.Dropdown.Citizenship, VERY_VERY_LONG_TIME);

        // FIXME: wait for actual options to be populated
        await sleep(SHORT_TIME);
    }

    public async selectCitizenship(value: string) {
        const dropdown = await this.bot.findElement(ELEMENTS.Dropdown.Citizenship);

        logger.info(`Select citizenship: ${value}`);
        await dropdown.sendKeys(value);

        await this.bot.waitForElement(ELEMENTS.Dropdown.NumberOfApplicants);
        await sleep(SHORT_TIME);
    }

    public async selectNumberOfApplicants(value: string) {    
        const dropdown = await this.bot.findElement(ELEMENTS.Dropdown.NumberOfApplicants);

        logger.info(`Select number of applicants: ${value}`);
        await dropdown.sendKeys(value);

        await this.bot.waitForElement(ELEMENTS.Dropdown.WithRelatives);
        await sleep(SHORT_TIME);
    }

    public async selectWithRelatives(value: string) {
        const dropdown = await this.bot.findElement(ELEMENTS.Dropdown.WithRelatives);
    
        logger.info(`Select with relatives: ${value}`);
        await dropdown.sendKeys(value);

        await this.bot.waitForElement(ELEMENTS.Buttons.ApplyForVisa);
        await sleep(SHORT_TIME);
    }

    public async clickOnApplyForVisaButton() {
        const button = await this.bot.findElement(ELEMENTS.Buttons.ApplyForVisa);

        logger.info(`Click on '${TEXTS.ApplyForVisa}' button.`);
        await button.click();

        await this.bot.waitForElement(ELEMENTS.Buttons.Employment);
    }

    public async clickOnEmploymentButton() {
        const button = await this.bot.findElement(ELEMENTS.Buttons.Employment);

        logger.info(`Click on '${TEXTS.Employment}' button.`);
        await button.click();

        await this.bot.waitForElement(ELEMENTS.Buttons.BlueCard);
    }

    public async clickOnBlueCardButton() {
        const button = await this.bot.findElement(ELEMENTS.Buttons.BlueCard);

        logger.info(`Click on '${TEXTS.BlueCard}' button.`);
        await button.click();

        await this.waitUntilSpinnerGone();
    }

    public async clickOnNextButton() {
        const button = await this.bot.findElement(ELEMENTS.Buttons.Submit);

        logger.info(`Click on 'Next' button.`);
        await button.click();

        await this.waitUntilSpinnerGone();

        // Give some time for button to become 'clickable'
        await sleep(SHORT_TIME);
    }

    // There should be one and only one 'apply for visa' button on the page:
    // anything else is a UI bug
    public async isUIValid() {
        const elements = await this.bot.findElements(ELEMENTS.Buttons.ApplyForVisa);

        return elements.length === 1;
    }

    public async hasErrorMessage() {
        return Promise.all([
            this.bot.findElement(ELEMENTS.Boxes.Messages),
            this.bot.findElement(ELEMENTS.Errors.NoAppointments),
        ])
        .then(() => {
            return true;
        })
        .catch((err: any) => {
            logger.error(err);
            return false;
        });
    }
}

export default AppointmentPage;