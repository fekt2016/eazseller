/**
 * VAT & Tax FAQ and policy summary for Seller Help Center
 * Seller-friendly language and GRA-aligned legal wording
 */

export const vatTaxPolicySummary = {
  title: 'VAT & Tax (Seller-Friendly Version)',
  intro: 'At Saiisai, sellers are responsible for following Ghana tax laws.',
  points: [
    'When you join Saiisai, you must tell us whether you are registered for VAT with the Ghana Revenue Authority (GRA).',
    {
      heading: 'If you ARE VAT registered',
      items: [
        'You must provide a valid VAT registration number.',
        'You are allowed to charge VAT on your products.',
        'The VAT collected from customers will be paid to you.',
        'You are responsible for declaring and paying that VAT to GRA.',
        'Saiisai does not pay VAT on your behalf.',
      ],
    },
    {
      heading: 'If you are NOT VAT registered',
      items: [
        'You are not allowed to charge VAT.',
        "Saiisai may add VAT to the customer's final price where required by law.",
        'Any VAT collected in this case is kept and paid to GRA by Saiisai.',
        'You will only be paid your product price (minus Saiisai fees).',
        'You will not receive any VAT amount.',
      ],
    },
    {
      heading: 'Important',
      items: [
        'Customers always see one final price.',
        'VAT may not be shown separately.',
        'Giving false VAT information may lead to account suspension.',
      ],
    },
  ],
};

export const vatTaxFaqItems = [
  {
    q: 'Do I need VAT registration to sell on Saiisai?',
    a: 'No. You can sell without VAT registration. However, VAT rules will apply differently depending on your status.',
  },
  {
    q: 'If I am VAT registered, who gets the VAT?',
    a: "You do. Saiisai pays VAT amounts to VAT-registered sellers, and the seller pays GRA.",
  },
  {
    q: 'If I am NOT VAT registered, do I get VAT?',
    a: 'No. Saiisai withholds VAT and pays it directly to GRA.',
  },
  {
    q: "Why doesn't the checkout show VAT?",
    a: "To keep checkout simple, Saiisai shows one final price. VAT is handled in the background.",
  },
  {
    q: "Does Saiisai charge VAT on its commission?",
    a: "Yes. Where required by law, VAT may be charged on Saiisai's commission or service fees.",
  },
  {
    q: 'What happens if I give wrong VAT information?',
    a: 'Saiisai may: withhold payouts; adjust transactions; or suspend or close your account.',
  },
];

export const vatGralegalWording = {
  title: 'GRA-aligned VAT wording (legal)',
  text: 'VAT is chargeable only by taxable persons registered under the Value Added Tax Act, 2013 (Act 870). Saiisai\'s VAT handling follows this principle by: allowing only VAT-registered sellers to receive VAT; treating non-registered sellers as non-taxable persons; and remitting VAT directly where required. Saiisai acts as a marketplace facilitator, not the supplier of seller goods, and is a taxable person only for its own commissions and services.',
};

export default { vatTaxPolicySummary, vatTaxFaqItems, vatGralegalWording };
