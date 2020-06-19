import 'react-crud-admin/css';

import React from 'react';

import Admin from 'react-crud-admin';
import Form from 'react-jsonschema-form';

import {
  apiKey,
  apiURL,
} from './config';

const systemAttributeTypes = ['DEVICE_TYPE', 'OPERATING_SYSTEM'];

export class AudiencesAdmin extends Admin {
  constructor() {
    super();
    this.name = "Audience"; // name of the objects
    this.name_plural = "Audiences"; // name of the objects in plural
    this.list_display_links = ["name"]; // which property of the object is clickable
    this.list_display = ["name", "description"]; // a list of properties of the object to displayed on the list display page
    this.attributes = [];
  }
  get_queryset(page_number, list_per_page, queryset) {
    this.fetchAudiences();
    this.getAttributes();
    return queryset;
  }

  async fetchAudiences() {
    this.show_progress();
    const audiencesResponse = await fetch(`${apiURL}/audiences`, {
      headers: {
        api_key: apiKey
      }
    });

    const audiences = await audiencesResponse.json();
    this.set_queryset(audiences);
    this.hide_progress();
  }

  async getAttributes() {
    const attributesResponse = await fetch(`${apiURL}/attributes`, {
      headers: {
        api_key: apiKey,
      }
    });

    const attributes = await attributesResponse.json();
    this.attributes = attributes;
  }

  get_form(object = null) {
    const attributeIds = this.attributes.map(attribute => attribute._id);
    const attributeNames = this.attributes.map(attribute => attribute.name);
    let schema = {
      definitions: {
        ruleCombination: {
          title: 'Rule Combination',
          type: 'object',
          // required: ['combinationType', 'rules'],
          default: {
            combinationType: 'AND',
            rules: [],
          },
          required: [],
          properties: {
            combinationType: {
              type: 'string',
              enum: ['AND', 'OR'],
              default: 'AND',
            },
            rules: {
              type: 'array',
              items: {
                type: 'object',
                anyOf: [
                  {
                    "$ref": "#/definitions/rule"
                  },
                  {
                    "$ref": "#/definitions/ruleCombination"
                  },
                ]
              }
            }
          }
        },
        rule: {
          title: 'Rule',
          type: 'object',
          required: ['attribute', 'attributeMatchCondition', 'invertCondition'],
          default: {
            attribute: {
              ref: attributeIds[0],
            },
            attributeMatchCondition: 'STRING_EQUALS',
            invertCondition: false,
          },
          properties: {
            attribute: {
              type: 'object',
              title: 'Reference to attribute',
              required: ['ref'],
              properties: {
                ref: {
                  title: 'Attribute Reference',
                  type: 'string',
                  enum: attributeIds.concat(systemAttributeTypes),
                  enumNames: attributeNames.concat(systemAttributeTypes),
                  default: attributeIds[0],
                }
              }
            },
            attributeMatchCondition: {
              type: "string",
              title: "Attribute Match Condition",
              enum: [
                'STRING_EQUALS',
                'HAS_ANY_VALUE',
                'CONTAINS_SUBSTRING',
                'IS_FALSE',
                'IS_TRUE',
                'NUMBER_LESS_THAN',
                'NUMBER_GREATER_THAN',
                'NUMBER_EQUAL_TO',
              ],
              default: "STRING_EQUALS"
            },
            invertCondition: {
              type: "boolean",
              title: "Invert the attribute matching condition",
              default: false
            },
            attributeValue: { type: "string", title: "Attribute Value", default: "" },
          }
        }
      },
      title: this.name,
      type: "object",
      // required: ["name", "definition"],
      required: [],
      properties: {
        _id: {
          type: "string",
          title: "Audience ID",
          default: ""
        },
        name: {
          type: "string",
          title: "Name",
          default: ""
        },
        description: { type: "string", title: "Description", default: "" },
        definition: {
          '$ref': '#/definitions/ruleCombination',
        }
      }
    };

    if (!object) {
      return <Form schema={schema} onSubmit={this.formSubmit.bind(this)} />;
    } else {
      return <Form schema={schema} formData={object} onSubmit={this.formSubmit.bind(this)} />;
    }
  }

  formSubmit(form) {
    console.log(form.formData);
    function setTypesForRuleCombination(ruleCombination) {
      ruleCombination.__type = 'RuleCombination';
      for (const rule of ruleCombination.rules) {
        setTypesForRule(rule);
      }
    }

    function setTypesForRule(rule) {
      if (rule.combinationType !== undefined) {
        setTypesForRuleCombination(rule);
      } else {
        rule.__type = 'Rule';
        if (systemAttributeTypes.includes(rule.attribute.ref)) {
          rule.attribute.__type = 'PresetAttributeReference';
        } else {
          rule.attribute.__type = 'UserAttributeReference';
        }
      }
    }

    setTypesForRuleCombination(form.formData.definition);

    if (form.edit) {
      this.updateAudience(form.formData);
    } else {
      this.createAudience(form.formData);
    }
  }

  async createAudience(formData) {
    this.show_progress();
    const response = await fetch(`${apiURL}/audiences`, {
      headers: {
        api_key: apiKey,
        'Content-Type': 'application/json',
      },
      method: 'POST',
      body: JSON.stringify(formData),
    });
    if (response.status !== 201) {
      const errorResponse = await response.json();
      alert('Error updating: \n' + JSON.stringify(errorResponse.message));
    }

    this.response_add();
    await this.fetchAudiences();
    this.hide_progress();
  }

  get_actions() {
    {
      return {
        delete: this.deleteAudiences.bind(this),
      }
    }
  }

  async deleteAudiences(audiences) {
    this.show_progress();
    const continueDelete = window.confirm(`Delete ${audiences.length} ${audiences.length === 1 ? 'audience' : 'audiences'}?`);
    if (!continueDelete) {
      return;
    }

    for (let audience of audiences) {
      await this.deleteAudience(audience);
    }

    await this.fetchAudiences();
    this.hide_progress();
  }

  async deleteAudience(audience) {
    await fetch(`${apiURL}/audiences/${audience._id}`, {
      headers: {
        api_key: apiKey
      },
      method: 'DELETE',
    });
  }

  async updateAudience(formData) {
    console.log(formData);
    this.show_progress();
    const response = await fetch(`${apiURL}/audiences/${formData._id}`, {
      headers: {
        api_key: apiKey,
        'Content-Type': 'application/json',
      },
      method: 'PUT',
      body: JSON.stringify(formData),
    });
    if (response.status !== 200) {
      const errorResponse = await response.json();
      alert('Error updating: \n' + JSON.stringify(errorResponse.message));
    }

    this.response_add();
    await this.fetchAudiences();
    this.hide_progress();
  }
}