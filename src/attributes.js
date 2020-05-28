import React from "react";
import Admin from "react-crud-admin";
import Form from "react-jsonschema-form";
import "react-crud-admin/css";
import { apiURL, apiKey } from "./config";
 
export class AttributesAdmin extends Admin {
  constructor() {
    super();
    this.name = "Attribute"; // name of the objects
    this.name_plural = "Attributes"; // name of the objects in plural
    this.list_display_links = ["key"]; // which property of the object is clickable
    this.list_display = ["key", "description"]; // a list of properties of the object to displayed on the list display page
  }
  get_queryset(page_number, list_per_page, queryset) {
    this.fetchAttributes();
    return queryset;
  }

  async fetchAttributes() {
    this.show_progress();
    const attributesResponse = await fetch(`${apiURL}/attributes`, {
      headers: {
        api_key: apiKey
      }
    });

    const attributes = await attributesResponse.json();
    this.set_queryset(attributes);
    this.hide_progress();
  }

  get_form(object = null) {
    let schema = {
      title: this.key,
      type: "object",
      required: ["key"],
      properties: {
        _id: {
          type: "string",
          title: "Attribute ID",
          default: ""
        },
        key: {
          type: "string",
          title: "Key",
          default: ""
        },
        description: { type: "string", title: "Description", default: "" },
      }
    };
 
    if (!object) {
      return <Form schema={schema} onSubmit={this.formSubmit.bind(this)} />;
    } else {
      return <Form schema={schema} formData={object} onSubmit={this.formSubmit.bind(this)} />;
    }
  }

  formSubmit(form) {
    if (form.edit) {
      this.updateAttribute(form.formData);
    } else {
      this.createAttribute(form.formData);
    }
  }

  async createAttribute(formData) {
    this.show_progress();
    const response = await fetch(`${apiURL}/attributes`, {
      headers: {
        api_key: apiKey,
        'Content-Type': 'application/json',
      },
      method: 'POST',
      body: JSON.stringify(formData),
    });

    const attribute = await response.json();
    this.state.queryset.push(attribute);
    this.response_add();
    this.hide_progress();
  }

  get_actions() {
    {
      return {
        delete: this.deleteAttributes.bind(this),
      }
    }
  }

  async deleteAttributes(attributes) {
    this.show_progress();
    const continueDelete = window.confirm(`Delete ${attributes.length} ${attributes.length === 1 ? 'attribute' : 'attributes'}?`);
    if (!continueDelete) {
      return;
    }

    for (let attribute of attributes) {
      await this.deleteAttribute(attribute);
    }

    await this.fetchAttributes();
    this.hide_progress();
  }

  async deleteAttribute(attribute) {
    await fetch(`${apiURL}/attributes/${attribute._id}`, {
      headers: {
        api_key: apiKey
      },
      method: 'DELETE',
    });
  }

  async updateAttribute(formData) {
  }
}