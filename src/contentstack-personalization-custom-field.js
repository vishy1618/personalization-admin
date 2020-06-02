<html>
<head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>

    <script type="text/javascript" src="https://code.jquery.com/jquery-1.x-git.min.js"></script>

    <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.1.3/css/bootstrap.min.css" integrity="sha384-MCw98/SFnGE8fJT3GXwEOngsV7Zt27NXFoaoApmYm81iuXoPkFOJwJ8ERdknLPMO"
        crossorigin="anonymous">
    <script src="https://stackpath.bootstrapcdn.com/bootstrap/4.1.3/js/bootstrap.min.js" integrity="sha384-ChfqqxuZUCnJSK3+MXmPNIyE6ZbWh2IMqE241rYiqJxyMiZ6OW/JmZQ5stwEULTy"
        crossorigin="anonymous">
    </script>

    <link rel="stylesheet" href="https://assets.contentstack.io/v3/assets/bltd1343376dfba54d2/blt87d67698547696b1/5bbdf8591ecf66190c1b9dd5/selectize.bootstrap3.css" />
    <script type="text/javascript" src="https://assets.contentstack.io/v3/assets/bltd1343376dfba54d2/blta4c5a4f8fbfa58fb/5bbc6b9ca50786140c1fde33/selectize.min.js"></script>

    <script src="https://unpkg.com/@contentstack/ui-extensions-sdk@2.1.1/dist/ui-extension-sdk.js"></script>
    <link rel="stylesheet" type="text/css" href="https://unpkg.com/@contentstack/ui-extensions-sdk@2.1.1/dist/ui-extension-sdk.css">
</head>
<body>
      <select id="select-tools"></select>
      <script>
        let extensionField;
        let audiences = [];

        function calculateHeight() {
          let body = document.body;
          let html = document.documentElement;

          let height = Math.max(body.scrollHeight, body.offsetHeight,
            html.clientHeight, html.scrollHeight, html.offsetHeight);
          extensionField.window.updateHeight(height);
        }

        class Personalization {
          constructor({apiKey}) {
            this.apiKey = apiKey;
          }

          getAudiences() {
            let request = this;
            let statusCode;
            return new Promise((resolve, reject) => {
              fetch(`https://contentstack-personalization.herokuapp.com/audiences`, {
                method: 'GET',
                headers: {
                  api_key: this.apiKey
                }
              }).then((response) => {
                statusCode = response.status;
                return response.json();
              }).then((response) => {
                if (statusCode === 200) resolve(response);
                throw Error('Failed to fetch resource');
              }).catch((err) => {
                reject(err);
              });
            });
          }
        }

        function domChangeListner(data) {
          let fieldValue;

          $('#select-tools').on('change', () => {
            fieldValue = $('#select-tools').val();
            let extensionFieldData;
            if (fieldValue !== null) {
              console.log('on change field value', fieldValue)
              data.forEach((element) =>{
                if (fieldValue === element._id) {
                  extensionFieldData = element
                }
              });
            }

            return extensionField.field.setData(extensionFieldData);
          });

          $('.selectize-control').on('click', () => {
            calculateHeight();
          });
        }

        function calculateDomHeight() {
          let elHeight = $('.selectize-control').outerHeight() + $('.selectize-dropdown ').height();
          extensionField.window.updateHeight(elHeight);
        }

        function render(data) {
          //  to get previously selected
          let fieldData = extensionField.field.getData();
          let selectedValues = [];

          console.log('existing extension field data', fieldData);
          if (Object.keys(fieldData).length !== 0) {
            selectedValues.push(fieldData._id);
          }

          $('#select-tools').selectize({
            plugins: [],
            maxItems: 1,
            valueField: '_id',
            labelField: 'name',
            searchField: 'name',
            options: data,
            create: false,
            items: selectedValues,
            hideSelected: true,
            onFocus: () => {
              calculateHeight();
              $('#select-tools-selectized').attr('placeholder', 'Start typing to search');
            },
            onBlur: () => {
              if ($('.option').length === 0) {
                $('#select-tools-selectized').attr('placeholder', ' ');
              } else {
                $('#select-tools-selectized').attr('placeholder', 'Click to select options');
              }
              let elHeight = $('.selectize-control').outerHeight();
              extensionField.window.updateHeight(elHeight);
            },
            onInitialize: () => {
              if (selectedValues.length === 0) {
                $('#select-tools-selectized').attr('placeholder', 'Click to select options');
              } else if (selectedValues.length === audiences.length) {
                $('#select-tools-selectized').attr('placeholder', ' ');
              } else {
                $('#select-tools-selectized').attr('placeholder', 'Click to select options');
              }
              let elHeight = $('.selectize-control').outerHeight();
              extensionField.window.updateHeight(elHeight);
            },
            onDropdownOpen: () => {
              calculateDomHeight();
            },
            onItemAdd: () => {
              if ($('.option').length === 0) {
                $('#select-tools-selectized').attr('placeholder', ' ');
              } else {
                $('#select-tools-selectized').attr('placeholder', 'Start typing to search');
              }
            },
            onItemRemove: () => {
              $('#select-tools-selectized').attr('placeholder', 'Start typing to search');
              calculateDomHeight();
            }

          });

          // Step 3:  domChangeListner - Start listner on select field to set data for field
          // on selection change
          domChangeListner(data);
        }


        $(document).ready(() => {
          // Step:1 Intializing extension - In this step we try to connect to host
          //  window using postMessage API and get intial data.

          ContentstackUIExtension.init().then(extension => { // current extension object
            extensionField = extension;

            let personalization = new Personalization(extension.config); // initialize request object using config
            personalization.getAudiences().then((response) => {
              // Step 2:  Render - Render the data fetched from external service
              render(response);
            });
          });
        });
     </script>
</body>
</html>