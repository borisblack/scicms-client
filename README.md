# SciCMS Client

Client web application for headless content management system [SciCMS Core](https://github.com/borisblack/scicms-core).

Initially, the system was created as an integration basis for managing data from various sources in industrial enterprises.
SciCMS (short for Scientific CMS) focuses on supporting high-tech industries.
In such industries, the product lifecycle is characterized by a large amount of data with a complex multi-level structure.
Additionally, there are a number of requirements for versioning and multilingual records, as well as the possibility of consolidating data from various sources.
The development of the system was influenced by projects such as [Aras Innovator](https://aras.com) and [Strapi](https://strapi.io).

## Main features of the system

- simple and flexible management of stored data structures;
- wide range of data types;
- support for data versioning;
- multilingual support;
- support for multiple data sources;
- support for relationships between stored Items (one-to-one, many-to-one, one-to-many, many-to-many);
- access control at the record level;
- a mechanism for blocking records from being changed by other users;
- user authentication locally and using the OAuth2 protocol;
- support for storing files both in the local file system and in S3;
- lifecycle hooks of stored Items;
- tools for creating analytical reporting;
- extensibility of the interface and business logic of the application through plug-ins.

## Get Started

Before starting work, it is recommended to read the SciCMS Core server [documentation](https://github.com/borisblack/scicms-core).

### Launch

SciCMS Client is a React application written in Typescript. The [Create React App](https://create-react-app.dev) environment is used for building.
[Ant Design](https://ant.design) was selected as the UI framework.

Before the first launch, we need to install dependencies with the `yarn install` command (in the project's working directory).

The following commands are available:
- `yarn start-rewired` - local launch; the application will be opened in the browser at [http://localhost:3000](http://localhost:3000); when changes are made to the source code, the page will automatically reload; linter errors and warnings will be displayed in the terminal;
- `yarn test` - launching tests;
- `yarn build` - building of an optimized bundle for industrial use.

### Login

The login form has two tabs: `System` and `OAuth2`. The first one is used to log in with a local account, the second one - using the OAuth2 protocol.

![Login form](docs/img/menu.png "Login form")

The first login can be done with the local account `root` and password `master`.
This administrative account is created automatically on the SciCMS Core server upon first launch.
To log in using the OAuth2 protocol, we must first [configure](https://github.com/borisblack/scicms-core/blob/main/docs/ru/security.md "Security") the server.

### Basic settings

The application configuration files are located in the [src/config](src/config) folder. The main program settings are the SciCMS Core server URL and the interface language.
The easiest (and recommended) way to change them is to use environment variables:
- `REACT_APP_CORE_URL` - SciCMS Core server URL (default value is `http://localhost:8079`, corresponds to a locally running server instance);
- `REACT_APP_I18N_LNG` - interface language (default value - `en-US`); currently available values ​​are `en-US` and `ru-RU`.

Variables can be set in `.env` files for different environments, see [documentation](https://create-react-app.dev/docs/adding-custom-environment-variables) for more details.

Other settings can be set directly in configuration files in the [src/config](src/config) directory.

### Localization

Application localization files are located in the [src/i18n](src/i18n) and [src/i18n/custom](src/i18n/custom) directories.
Currently, localizations have been implemented for English and Russian languages.

### Operations with Items

The central concept in SciCMS is **Item**.
In the object-oriented programming analogy, an Item is a class (a description of fields and methods), and a record for a given Item is an instance of a class (specific data). For more information about Items and the SciCMS data model, see [SciCMS Core documentation](https://github.com/borisblack/scicms-core/blob/main/docs/data_model.md "Data Model").

To work with Items, we need select the menu item **Administration/Items**, a tab will open with a list of available Items.
To create an Item, in the tab with the list of Items, click the **Create** button.
For example, to create a `book` Item in the edit form, we need to fill in the fields **Name**, **Plural Name**, **Table Name** and add the `name` and `rating` attributes:

![Creating an Item](docs/img/item_creating.png "Creating an Item")

For more information about Item attributes, see the [Items Management](/docs/item_management.md) section.
After clicking the **Save** button, we must re-enter the application (a corresponding dialog box with a suggestion will be displayed).

To view and edit an Item, double-click on the selected line in the list tab.
Editing is carried out in three stages: locking by pressing the **Edit** button, editing itself, and unlocking by pressing the **Save** button.
This behavior is set for all Items in the system by default and can be changed if the **Not Lockable** flag is enabled on the Item edit form.
In this case, there will only be a **Save** button and the form fields will always be available for editing. Updating system Items (with the `core` = `true` flag) is prohibited.

Deleting can be done either from the editing form, or on the tab with the list by calling the context menu of the Item.

### Working with a table list

Lists in SciCMS have tools for filtering, sorting and pagination. At the top of the table there is a row with filters for each column.
Filters are combined according to the **AND** condition. The way filters work depends on the type of column:
- for string types, a partial match is searched without regard to case;
- for numeric types, a literal comparison is made;
- for the Boolean type, valid filter values ​​are: `1`, `0`, `true`, `false`, `yes`, `no`, `y`, `n`;
- the filter for the `date` type can accept the following formats: `31.12.2023`, `2023-12-31` (filter by range of 1 day); `12.2023`, `2023-12` (filter by range of 1 month); `2023` (filter by 1 year range);
- the filter for the `time` type can accept the following formats: `23:59` (filter by range of 1 minute); `23` (filter by 1 hour range);
- the filter for the `datetime` and `timestamp` types can accept the following formats: `31.12.2023 23:59`, `2023-12-31 23:59` (filter by range of 1 minute); `31.12.2023 23`, `2023-12-31 23` (filter by 1 hour range); `31.12.2023`, `2023-12-31` (filter by range of 1 day); `12.2023`, `2023-12` (filter by range of 1 month); `2023` (filter by 1 year range);
- for relationships of type `oneToOne` and `manyToOne`, a partial match is searched for the title attribute, case insensitive; the title attribute is set in the `titleAttribute` field of the Item (if not set, the identifier is used).

## Application menu

To work with newly created Items, we need to add them to the application menu.
To do this, we need to either edit the file [src/config/menu.ts](src/config/menu.ts) or add a configuration parameter `menu` with type `json` and a similar value as a JSON object.
Configuration parameters are managed from the **Administration/Settings** menu.
The menu configuration object with the new category and `book` Item is shown below.
Each item in the `items` list is either a selectable menu item or a category.
```javascript
const menuConfig: MenuConfig = {
  items: [{
    key: 'administration',
    label: 'Administration',
    icon: 'CrownOutlined',
    roles: [ROLE_ADMIN],
    children: [{
      itemName: 'property'
    }, {
      key: 'security',
      label: 'Security',
      icon: 'LockOutlined',
      roles: [ROLE_ADMIN],
      children: [{
        itemName: 'group'
      }, {
        itemName: 'user'
      }, {
        itemName: 'permission'
      }, {
        itemName: 'identity'
      }]
    }, {
      key: 'storage',
      label: 'Storage',
      icon: 'FaDatabase',
      roles: [ROLE_ADMIN],
      children: [{
        itemName: 'datasource'
      }, {
        itemName: 'media'
      }]
    }, {
      itemName: 'itemTemplate'
    }, {
      itemName: 'item'
    }]
  }, {
    key: 'analysis',
    label: 'Analysis',
    icon: 'PieChartOutlined',
    roles: [ROLE_ADMIN, ROLE_ANALYST],
    children: [{
      itemName: 'dataset'
    }, {
      itemName: 'dashboard'
    }, {
      itemName: 'dashboardCategory'
    }]
  }, {
    key: 'library',
    label: 'Library',
    children: [{
      itemName: 'book'
    }]
  }]
}
```

The selected menu item contains a single field `itemName` - the name of the Item.
The action when clicking on a menu item is to open a tab with a list of records for the specified Item.
The contents of the list page (like many others) can also be overridden through the [extensions](docs/extensions.md) mechanism.

The menu category contains the following fields:
- `key` - unique string key of the category;
- `label` - display name of the category (localized string);
- `icon` - category icon (optional field);
- `roles` - roles for which the category is available; for more information about roles, see [SciCMS Core documentation](https://github.com/borisblack/scicms-core/blob/main/docs/security.md "Security");
- `children` - child categories/items.

After saving the menu and refreshing the page, it should look like this:

![Application Menu](img/menu.png "Application Menu")

When we select the **Library/Books** item, a list of Items with a standard set of operations will open.

## Additional resources

[Items management](docs/item_management.md)

[Security](docs/security.md)

[Items lifecycle](docs/ru/lifecycle.md)

[Analytics tools](docs/analytics.md)

[Extensions](docs/extensions.md)
