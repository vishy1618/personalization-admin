import 'react-crud-admin/css';

import React from 'react';

import Admin from 'react-crud-admin';
import Form from 'react-jsonschema-form';

import {
  apiKey,
  apiURL,
} from './config';

export class VariationsAdmin extends Admin {
  constructor() {
    super();
    this.name = "Variation"; // name of the objects
    this.name_plural = "Variations"; // name of the objects in plural
    this.list_display_links = ["name"]; // which property of the object is clickable
    this.list_display = ["name", "description"]; // a list of properties of the object to displayed on the list display page
    this.audiences = [];
  }
  get_queryset(page_number, list_per_page, queryset) {
    this.fetchAudiences();
    this.fetchVariations();
    return queryset;
  }

  async fetchAudiences() {
    this.show_progress();
    const audiencesResponse = await fetch(`${apiURL}/audiences`, {
      headers: {
        api_key: apiKey
      }
    });

    this.audiences = await audiencesResponse.json();
  }

  async fetchVariations() {
    const variationsResponse = await fetch(`${apiURL}/variations`, {
      headers: {
        api_key: apiKey,
      }
    });

    this.variations = await variationsResponse.json();
    this.set_queryset(this.variations);
    this.hide_progress();
  }

  get_form(object = null) {
    let schema = {
      title: this.name,
      type: "object",
      required: ['name'],
      properties: {
        _id: {
          type: "string",
          title: "ID",
          default: ""
        },
        name: {
          type: "string",
          title: "Name",
          default: ""
        },
        description: { type: "string", title: "Description", default: "" },
        variants: {
          type: 'array',
          items: {
            type: 'object',
            required: ['name', 'audiences', 'audienceCombinationType'],
            properties: {
              name: {
                type: "string",
                title: "Variant Name",
                default: ""
              },
              audiences: {
                type: 'array',
                items: {
                  type: 'string',
                  enum: this.audiences.map(audience => audience._id),
                  enumNames: this.audiences.map(audience => audience.name),
                  default: this.audiences[0] && this.audiences[0]._id,
                }
              },
              audienceCombinationType: {
                type: 'string',
                enum: ['AND', 'OR'],
                default: 'AND',
              }
            }
          }
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

    if (form.edit) {
      this.updateVariation(form.formData);
    } else {
      this.createVariation(form.formData);
    }
  }

  async createVariation(formData) {
    this.show_progress();
    const response = await fetch(`${apiURL}/variations`, {
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
    await this.fetchVariations();
    this.hide_progress();
  }

  get_actions() {
    return {
      delete: this.deleteVariations.bind(this),
    }
  }

  async deleteVariations(variations) {
    this.show_progress();
    const continueDelete = window.confirm(`Delete ${variations.length} ${variations.length === 1 ? 'variation' : 'variations'}?`);
    if (!continueDelete) {
      return;
    }

    for (let variation of variations) {
      await this.deleteVariation(variation);
    }

    await this.fetchVariations();
    this.hide_progress();
  }

  async deleteVariation(variation) {
    await fetch(`${apiURL}/variations/${variation._id}`, {
      headers: {
        api_key: apiKey
      },
      method: 'DELETE',
    });
  }

  async updateVariation(formData) {
    console.log(formData);
    this.show_progress();
    const response = await fetch(`${apiURL}/variations/${formData._id}`, {
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
    await this.fetchVariations();
    this.hide_progress();
  }
}