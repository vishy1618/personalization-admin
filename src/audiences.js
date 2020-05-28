import React from "react";
import Admin from "react-crud-admin";
import Form from "react-jsonschema-form";
import "react-crud-admin/css";
import { apiURL, apiKey } from "./config";
 
export class AudiencesAdmin extends Admin {
  constructor() {
    super();
    this.name = "Audience"; // name of the objects
    this.name_plural = "Audiences"; // name of the objects in plural
    this.list_display_links = ["name"]; // which property of the object is clickable
    this.list_display = ["name", "description"]; // a list of properties of the object to displayed on the list display page
  }
  get_queryset(page_number, list_per_page, queryset) {
    this.fetchAudiences();
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

  get_form(object = null) {
    let schema = {
      title: this.name,
      type: "object",
      required: ["name", "attribute", "attributeValue"],
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
        attribute: {
          type: "object",
          title: "Attribute Reference",
          properties: {
            _id: {
              type: "string",
              title: "Attribute ID",
              default: ""
            },
            key: {
              type: "string",
              title: "Attribute Key",
              default: ""
            },
            description: {
              type: "string",
              title: "Attribute Description",
              default: ""
            },
          }
        },
        attributeValue: { type: "string", title: "Attribute Value", default: "" },
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
      this.updateAudience(form.formData);
    } else {
      this.createAudience(form.formData);
    }
  }

  async createAudience(formData) {
    this.show_progress();
    formData.attribute = formData.attribute._id;
    await fetch(`${apiURL}/audiences`, {
      headers: {
        api_key: apiKey,
        'Content-Type': 'application/json',
      },
      method: 'POST',
      body: JSON.stringify(formData),
    });

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
    this.show_progress();
    formData.attribute = formData.attribute._id;
    await fetch(`${apiURL}/audiences/${formData._id}`, {
      headers: {
        api_key: apiKey,
        'Content-Type': 'application/json',
      },
      method: 'PUT',
      body: JSON.stringify(formData),
    });

    this.response_add();
    await this.fetchAudiences();
    this.hide_progress();
  }
}