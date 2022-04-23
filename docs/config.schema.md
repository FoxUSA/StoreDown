# Config Schema

TODO `_id` and `location` are special required fields

## Config structure

    # theme: #TODO
    # hooks: #TODO
    # savedSerches: #TODO
    dataDefinition:
      - displayName: Core info
        color: light-blue darken-2 #pick colors from https://v15.vuetifyjs.com/en/framework/colors
        fields:
          - name: _id
            displayName: ID #Trim option? So only a substring it shown? IE replace substr logic in list view
            type: string
            disabled: true
            showInTree: true
            size: 12
          - name: name
            displayName: Name
            type: string
            showInTree: true
          - name: location
            displayName: Location
            type: path
            size: 12
            #showInTree: true #Always shown

## Data Definition

Data definition is a list of sections. These section group field in the new entry screen.

##### Example:

    - displayName: Core info
      color: light-blue darken-2
      size: 12
      fields: []

##### Attributes:

| Attribute name | Required | Default                                                                            | Description                                                                                                    |
| -------------- | -------- | ---------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| `displayName`  | No       |                                                                                    | Used to label the section on the new entry screen.                                                             |
| `color`        | No       |                                                                                    | [Vuetify colors](https://v15.vuetifyjs.com/en/framework/colors) to set section background in new entry screen. |
| `size`         | No       | `12` on small screens. <br> `6` on large screens. <br> `4` on extra large screens. | How wide to make section in new entry screen. Can be from 1-12. Why 12? It's divisible into halves and thirds. |
| `fields`       | No       |                                                                                    | List of fields to to store. See below for field definitions                                                    |

* * *

### Common fields Attributes

##### Example:

    name: _id
    displayName: ID
    type: string
    disabled: true
    showInTree: true
    size: 12
    color: red

##### Attributes:

| Attribute name | Required | Default                                                                            | Description                                                                                                    |
| -------------- | -------- | ---------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| `name`         | Yes      |                                                                                    | Logical name for a field. Should be machine readable name. Case sensitive, no spaces or special characters.    |
| `displayName`  |          |                                                                                    | Human readable name for a field. Can contain spaces and special characters.                                    |
| `type`         | Yes      |                                                                                    | Type of the field. See options below.                                                                          |
| `showInTree`   | No       | `false`                                                                            | Used in the tree view to show a field in results.                                                              |
| `size`         | No       | `12` on small screens. <br> `6` on large screens. <br> `4` on extra large screens. | How wide to make section in new entry screen. Can be from 1-12.                                                |
| `color`        | No       | Various                                                                            | [Vuetify colors](https://v15.vuetifyjs.com/en/framework/colors) to set section background in new entry screen. |

* * *

### String field type

A generic field type.

##### Example:

    - name: name
      displayName: Name
      type: string
      disabled: true
      showInTree: true
      size: 12
      color: red

##### Attributes:

In addition to the common field attributes.

| Attribute name | Required | Default | Description                                                          |
| -------------- | -------- | ------- | -------------------------------------------------------------------- |
| disabled       | No       | `false` | Determines if the field should be editable on the item entry screen. |

* * *

### Path field type

A special field type. This field expects a `/` delimited path(Like a file system) and is used to render the data in a tree view.

##### Example:

    - name: location
      displayName: Location
      prefixes: {}
      type: path
      size: 12

##### Prefix Example:

    - name: location
      displayName: Location
      prefixes:
        Box01: House/Room/ #Typing in `Box01` will act as if you entered in `House/Room/Box01` because of this configured prefix
      type: path
      size: 12

##### Attributes:

In addition to the common field attributes.

| Attribute name | Required | Default | Description                                                          |
| -------------- | -------- | ------- | -------------------------------------------------------------------- |
| `disabled`     | No       | `false` | Determines if the field should be editable on the item entry screen. |
| `prefixes`     | Yes      |         | Map of fixed prefixes                                                |

* * *

### Boolean field type

A toggle field type with two states. `true` and `false`. Null is assumed to be `false`

##### Example:

    - name: idLabeled
      displayName: Item labeled with ID
      type: boolean
      color: red

* * *

### List field type

##### Example:

    - name: tags
      displayName: Tags
      type: list
      size: 12

##### Attributes:

| Attribute name | Required | Default | Description                                                                            |     |
| -------------- | -------- | ------- | -------------------------------------------------------------------------------------- | --- |
| `listType`     | No       |         | If specified the list one of the special types below. Otherwise its just a string list |     |

#### Link list subtype

##### Example:

    - name: imageURLs
      displayName: Image URLs
      type: list
      listType: link
      hideInList: true

#### UPC list code type

##### Example:

    - name: code
      displayName: Code
      type: list
      listType: upc
      size: 12
      hideInList: true

* * *

### Last Date type

Read only field that shows the last date from a list of fields.

##### Example:

    - name: lastTouchDate
      displayName: Last touch date
      type: lastDate
      dateFields:
        - name: status
          type: libraryStyleStatus
        - name: acquireDate

##### Attributes:

In addition to the common field attributes.

| Attribute name | Required | Default | Description                                                     |
| -------------- | -------- | ------- | --------------------------------------------------------------- |
| `dateFields`   | True     |         | List of date fields. Display the latest date from those options |

##### Date Fields Attributes:

| Attribute name | Required | Default | Description                                                                                                          |
| -------------- | -------- | ------- | -------------------------------------------------------------------------------------------------------------------- |
| `name`         | Yes      |         | Name of the field to include in latest date calculations                                                             |
| `type`         | Varies   |         | If value is a complex type like `libraryStyleStatus` it must be specified. Normal date fields this field is optional |

* * *

### Last Modified type

This field only updates when an entry is saved.

##### Example:

    - name: lastModified
      displayName: Last Modified
      type: lastModified

* * *

### Library Style Status type

A complex field type that lets you check in and check out.

##### Example:

    - name: status
      displayName: Status
      type: libraryStyleStatus #Checkin checkout
      size: 12
      showInTree: true
