// Questionnaire questions.
// Phase A = generic (industryId: null), Phase B = per-industry.
// inputType: 'text' | 'number' | 'boolean' | 'select'
// NOTE: option VALUES for select questions are the exact strings that
// rule-engine conditions reference (e.g. entityType: 'proprietorship').

const INDUSTRY_OPTIONS = [
    `food_processing`,
    `textile_manufacturing`,
    `handicrafts`,
    `it_services`,
];

const INDIAN_STATES = [
    `Andhra Pradesh`, `Arunachal Pradesh`, `Assam`, `Bihar`, `Chhattisgarh`, `Goa`,
    `Gujarat`, `Haryana`, `Himachal Pradesh`, `Jharkhand`, `Karnataka`, `Kerala`,
    `Madhya Pradesh`, `Maharashtra`, `Manipur`, `Meghalaya`, `Mizoram`, `Nagaland`,
    `Odisha`, `Punjab`, `Rajasthan`, `Sikkim`, `Tamil Nadu`, `Telangana`, `Tripura`,
    `Uttar Pradesh`, `Uttarakhand`, `West Bengal`,
    `Delhi`, `Jammu & Kashmir`, `Ladakh`, `Puducherry`, `Chandigarh`,
    `Andaman & Nicobar Islands`, `Dadra & Nagar Haveli and Daman & Diu`, `Lakshadweep`,
];

const phaseA = [
    {
        key: `businessName`,
        questionText: `What is your business called?`,
        inputType: `text`,
        options: null,
        orderIndex: 1,
    },
    {
        key: `industry`,
        questionText: `Which industry does your business belong to?`,
        inputType: `select`,
        options: INDUSTRY_OPTIONS,
        orderIndex: 2,
    },
    {
        key: `projectStage`,
        questionText: `What stage is your business at?`,
        inputType: `select`,
        options: [`new_business`, `already_operating`],
        orderIndex: 3,
    },
    {
        key: `entityType`,
        questionText: `What is your business entity type?`,
        inputType: `select`,
        options: [`proprietorship`, `partnership`, `llp`, `private_limited`],
        orderIndex: 4,
    },
    {
        key: `state`,
        questionText: `Which state is your business located in?`,
        inputType: `select`,
        options: INDIAN_STATES,
        orderIndex: 5,
    },
    {
        key: `district`,
        questionText: `Which district is your business located in?`,
        inputType: `text`,
        options: null,
        orderIndex: 6,
    },
    {
        key: `employeeCount`,
        questionText: `How many people does your business employ (including you)?`,
        inputType: `number`,
        options: null,
        orderIndex: 7,
    },
    {
        key: `investmentAmount`,
        questionText: `What is your total investment in plant, machinery and equipment (in ₹)?`,
        inputType: `number`,
        options: null,
        orderIndex: 8,
    },
    {
        key: `hasPhysicalPremises`,
        questionText: `Does your business operate from a physical premises (shop, office, factory, workshop)?`,
        inputType: `boolean`,
        options: null,
        orderIndex: 9,
    },
];

const phaseB = {
    food_processing: [
        {
            key: `isManufacturing`,
            questionText: `Do you manufacture/process food products yourself (rather than only trading or repacking)?`,
            inputType: `boolean`,
            options: null,
            orderIndex: 1,
        },
        {
            key: `annualTurnover`,
            questionText: `What is your expected annual turnover (in ₹)?`,
            inputType: `number`,
            options: null,
            orderIndex: 2,
        },
        {
            key: `generatesWastewater`,
            questionText: `Does your operation generate wastewater or effluents (washing, cleaning, processing)?`,
            inputType: `boolean`,
            options: null,
            orderIndex: 3,
        },
        {
            key: `handlesChemicals`,
            questionText: `Do you handle chemicals, preservatives, additives or solvents in your process?`,
            inputType: `boolean`,
            options: null,
            orderIndex: 4,
        },
        {
            key: `facilityZone`,
            questionText: `Where is your facility located?`,
            inputType: `select`,
            options: [`industrial`, `residential_mixed`],
            orderIndex: 5,
        },
    ],

    textile_manufacturing: [
        {
            key: `productionType`,
            questionText: `What type of production do you run?`,
            inputType: `select`,
            options: [`handloom`, `powerloom`],
            orderIndex: 1,
        },
        {
            key: `usesDyeingProcess`,
            questionText: `Do you carry out dyeing, printing or chemical processing of fabric/yarn?`,
            inputType: `boolean`,
            options: null,
            orderIndex: 2,
        },
        {
            key: `factoryWorkerCount`,
            questionText: `How many workers work in your production facility?`,
            inputType: `number`,
            options: null,
            orderIndex: 3,
        },
        {
            key: `needsIndustrialLand`,
            questionText: `Do you need to acquire or lease industrial land/shed for your unit?`,
            inputType: `boolean`,
            options: null,
            orderIndex: 4,
        },
    ],

    handicrafts: [
        {
            key: `producerType`,
            questionText: `Are you an individual artisan or a registered enterprise?`,
            inputType: `select`,
            options: [`individual_artisan`, `registered_enterprise`],
            orderIndex: 1,
        },
        {
            key: `salesChannel`,
            questionText: `How do you sell your products?`,
            inputType: `select`,
            options: [`online`, `offline`, `both`],
            orderIndex: 2,
        },
        {
            key: `giEligible`,
            questionText: `Are your products tied to a Geographical Indication (GI) craft or region (e.g. Pashmina, Channapatna, Madhubani)?`,
            inputType: `boolean`,
            options: null,
            orderIndex: 3,
        },
        {
            key: `annualTurnover`,
            questionText: `What is your expected annual turnover (in ₹)?`,
            inputType: `number`,
            options: null,
            orderIndex: 4,
        },
    ],

    it_services: [
        {
            key: `isPureService`,
            questionText: `Do you provide pure services (software development, consulting) with no physical product?`,
            inputType: `boolean`,
            options: null,
            orderIndex: 1,
        },
        {
            key: `hiringPlan`,
            questionText: `How do you plan to hire people?`,
            inputType: `select`,
            options: [`employees`, `contractors`, `both`],
            orderIndex: 2,
        },
        {
            key: `officeType`,
            questionText: `What kind of office will you operate from?`,
            inputType: `select`,
            options: [`registered_office`, `remote`],
            orderIndex: 3,
        },
        {
            key: `hasOverseasClients`,
            questionText: `Do you have or plan to have overseas (foreign) clients?`,
            inputType: `boolean`,
            options: null,
            orderIndex: 4,
        },
    ],
};

module.exports = { phaseA, phaseB };