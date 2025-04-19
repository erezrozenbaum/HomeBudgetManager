import React, { useState } from 'react';
import { Tab } from '@headlessui/react';

const Documentation = () => {
  const [selectedTab, setSelectedTab] = useState(0);

  const sections = [
    {
      title: 'Getting Started',
      content: [
        {
          title: 'First Launch',
          steps: [
            'Launch the application',
            'Set up your user profile (Name, Default currency, Timezone, Language preference)',
            'Configure initial settings'
          ]
        },
        {
          title: 'Dashboard Overview',
          description: 'The dashboard provides a quick overview of your financial status:',
          items: [
            'Net Balance',
            'Total Income',
            'Total Expenses',
            'Recent Transactions',
            'Spending Trends'
          ]
        }
      ]
    },
    {
      title: 'Core Features',
      content: [
        {
          title: 'Bank Accounts Management',
          subsections: [
            {
              title: 'Adding a Bank Account',
              steps: [
                'Click "Add Account"',
                'Enter account details (Name, Branch, Currency, Initial Balance)',
                'Choose a color for visual identification',
                'Save the account'
              ]
            },
            {
              title: 'Managing Accounts',
              items: [
                'View account details',
                'Update balances',
                'Link credit cards',
                'View transaction history'
              ]
            }
          ]
        },
        {
          title: 'Credit Cards',
          subsections: [
            {
              title: 'Adding a Credit Card',
              steps: [
                'Click "Add Credit Card"',
                'Enter card details (Name, Type, Issuer, Limit, Last 4 digits, Billing day)',
                'Link to bank account',
                'Save the card'
              ]
            },
            {
              title: 'Managing Cards',
              items: [
                'View card details',
                'Track spending',
                'Monitor billing cycles',
                'Set up payment reminders'
              ]
            }
          ]
        },
        {
          title: 'Transactions',
          subsections: [
            {
              title: 'Adding Transactions',
              steps: [
                'Click "Add Transaction"',
                'Enter transaction details (Date, Amount, Description, Category, Account/Card)',
                'Mark as recurring if applicable',
                'Save the transaction'
              ]
            },
            {
              title: 'Managing Transactions',
              items: [
                'View transaction history',
                'Filter by date, category, or account',
                'Edit or delete transactions',
                'Export to Excel/CSV'
              ]
            }
          ]
        },
        {
          title: 'Investments',
          subsections: [
            {
              title: 'Adding Investments',
              steps: [
                'Click "Add Investment"',
                'Select investment type (Crypto, Stocks, Real Estate)',
                'Enter details (Name, Amount, Purchase date, Current value)',
                'Link to saving goals if applicable'
              ]
            },
            {
              title: 'Tracking Investments',
              items: [
                'View performance',
                'Monitor value changes',
                'Set price alerts',
                'Generate reports'
              ]
            }
          ]
        },
        {
          title: 'Saving Goals',
          subsections: [
            {
              title: 'Creating Goals',
              steps: [
                'Click "Add Goal"',
                'Enter goal details (Name, Target amount, Target date, Currency)',
                'Set up automatic savings if desired'
              ]
            },
            {
              title: 'Tracking Progress',
              items: [
                'View goal status',
                'Monitor progress',
                'Adjust contributions',
                'Link to investments'
              ]
            }
          ]
        },
        {
          title: 'Loans',
          subsections: [
            {
              title: 'Adding Loans',
              steps: [
                'Click "Add Loan"',
                'Enter loan details (Name, Amount, Interest rate, Monthly payment, Start/end dates)',
                'Save the loan'
              ]
            },
            {
              title: 'Managing Loans',
              items: [
                'View repayment schedule',
                'Track payments',
                'Calculate interest',
                'Generate amortization tables'
              ]
            }
          ]
        },
        {
          title: 'Insurance',
          subsections: [
            {
              title: 'Adding Insurance',
              steps: [
                'Click "Add Insurance"',
                'Enter policy details (Name, Type, Provider, Premium amount, Payment frequency)',
                'Save the policy'
              ]
            },
            {
              title: 'Managing Insurance',
              items: [
                'Track payments',
                'Monitor coverage',
                'Set renewal reminders',
                'Compare policies'
              ]
            }
          ]
        },
        {
          title: 'Business Management',
          subsections: [
            {
              title: 'Adding a Business',
              steps: [
                'Click "Add Business"',
                'Enter business details (Name, Type, Users, Financial information)',
                'Save the business'
              ]
            },
            {
              title: 'Managing Business',
              items: [
                'Track financials',
                'Monitor performance',
                'Generate reports',
                'Link to investments'
              ]
            }
          ]
        }
      ]
    },
    {
      title: 'Advanced Features',
      content: [
        {
          title: 'AI Financial Advisor',
          subsections: [
            {
              title: 'Accessing AI Features',
              steps: [
                'Click "AI Advisor" in the sidebar',
                'Choose analysis type (Spending patterns, Investment recommendations, Debt management, Savings optimization)',
                'Select time period',
                'Review recommendations'
              ]
            },
            {
              title: 'Using AI Insights',
              items: [
                'Analyze spending patterns',
                'Get investment recommendations',
                'Optimize debt management',
                'Plan savings strategies'
              ]
            }
          ]
        },
        {
          title: 'Reports and Analytics',
          subsections: [
            {
              title: 'Generating Reports',
              steps: [
                'Click "Reports" in the sidebar',
                'Select report type (Summary, Detailed, Custom)',
                'Choose time period',
                'Select accounts/categories',
                'Generate report'
              ]
            },
            {
              title: 'Exporting Data',
              items: [
                'Select export format (PDF, Excel, CSV)',
                'Choose data range',
                'Download file'
              ]
            }
          ]
        }
      ]
    },
    {
      title: 'Security Features',
      content: [
        {
          title: 'Data Protection',
          items: [
            'All data stored locally',
            'Optional encryption',
            'Password protection',
            'Audit logging'
          ]
        },
        {
          title: 'Privacy Settings',
          items: [
            'Control data sharing',
            'Manage API access',
            'Configure backups',
            'Set up automatic updates'
          ]
        }
      ]
    },
    {
      title: 'Troubleshooting',
      content: [
        {
          title: 'Common Issues',
          subsections: [
            {
              title: 'Application Issues',
              items: [
                'Check Node.js installation',
                'Verify dependencies',
                'Check error logs'
              ]
            },
            {
              title: 'Database Issues',
              items: [
                'Verify database path',
                'Check file permissions',
                'Restore from backup'
              ]
            },
            {
              title: 'AI Features Issues',
              items: [
                'Check environment variables',
                'Verify model path',
                'Test API connection'
              ]
            }
          ]
        },
        {
          title: 'Support',
          items: [
            'Check documentation',
            'View error logs',
            'Contact support',
            'Submit bug reports'
          ]
        }
      ]
    }
  ];

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">User Manual</h1>
      
      <Tab.Group selectedIndex={selectedTab} onChange={setSelectedTab}>
        <Tab.List className="flex space-x-1 rounded-xl bg-blue-900/20 p-1 mb-6">
          {sections.map((section, index) => (
            <Tab
              key={index}
              className={({ selected }) =>
                `w-full rounded-lg py-2.5 text-sm font-medium leading-5
                ${selected
                  ? 'bg-white shadow text-blue-700'
                  : 'text-blue-100 hover:bg-white/[0.12] hover:text-white'
                }`
              }
            >
              {section.title}
            </Tab>
          ))}
        </Tab.List>
        
        <Tab.Panels className="mt-2">
          {sections.map((section, index) => (
            <Tab.Panel
              key={index}
              className="rounded-xl bg-white p-6 shadow-lg"
            >
              <div className="space-y-8">
                {section.content.map((content, contentIndex) => (
                  <div key={contentIndex} className="space-y-4">
                    <h2 className="text-2xl font-semibold">{content.title}</h2>
                    
                    {content.description && (
                      <p className="text-gray-600">{content.description}</p>
                    )}
                    
                    {content.steps && (
                      <ol className="list-decimal list-inside space-y-2">
                        {content.steps.map((step, stepIndex) => (
                          <li key={stepIndex} className="text-gray-700">
                            {step}
                          </li>
                        ))}
                      </ol>
                    )}
                    
                    {content.items && (
                      <ul className="list-disc list-inside space-y-2">
                        {content.items.map((item, itemIndex) => (
                          <li key={itemIndex} className="text-gray-700">
                            {item}
                          </li>
                        ))}
                      </ul>
                    )}
                    
                    {content.subsections && (
                      <div className="space-y-6">
                        {content.subsections.map((subsection, subsectionIndex) => (
                          <div key={subsectionIndex} className="ml-4">
                            <h3 className="text-xl font-medium mb-2">
                              {subsection.title}
                            </h3>
                            
                            {subsection.steps && (
                              <ol className="list-decimal list-inside space-y-2">
                                {subsection.steps.map((step, stepIndex) => (
                                  <li key={stepIndex} className="text-gray-700">
                                    {step}
                                  </li>
                                ))}
                              </ol>
                            )}
                            
                            {subsection.items && (
                              <ul className="list-disc list-inside space-y-2">
                                {subsection.items.map((item, itemIndex) => (
                                  <li key={itemIndex} className="text-gray-700">
                                    {item}
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </Tab.Panel>
          ))}
        </Tab.Panels>
      </Tab.Group>
    </div>
  );
};

export default Documentation; 