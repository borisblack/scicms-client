# Items lifecycle

SciCMS Core supports three ways to track (intercept) the life cycle (LC) of Items - hooks, calling custom methods and promotion.
To implement business logic in these methods, the Item must have an implementation (handler class) on the server, for more details see [SciCMS Core documentation](https://github.com/borisblack/scicms-core/blob/main/docs/ru/lifecycle.md "Items lifecycle").

The client application, in turn, allows us to configure the specification of an Item lifecycle and promote records within this lifecycle.
To edit the specification, we use the library [diagram-js](https://github.com/bpmn-io/diagram-js):

![Item Lifecycle Specification](/docs/img/lifecycle.png "Item Lifecycle Specification")

** Documentation is under development and contains incomplete information