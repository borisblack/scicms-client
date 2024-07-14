# Items lifecycle

SciCMS Core supports three ways to track (intercept) the life cycle (LC) of Items - hooks, calling custom methods and promotion.
To implement business logic in these methods, the Item must have an implementation (handler class) on the server, for more details see [SciCMS Core documentation](https://github.com/borisblack/scicms-core/blob/main/docs/lifecycle.md "Items lifecycle").

The client application, in turn, allows us to configure the specification of an Item lifecycle and promote records within this lifecycle.
To edit the specification, we use the library [diagram-js](https://github.com/bpmn-io/diagram-js):

![Item Lifecycle Specification](/docs/img/lifecycle.png "Item Lifecycle Specification")

Promotion within the lifecycle is performed by clicking on the **Promote** button.
In this case, a list of available states of the lifecycle appears, to which the record from the current state can be promoted:

![List of available lifecycle states for promotion](img/lifecycle_states.png "List of available lifecycle states for promotion")

If the server has a lifecycle implementation class, then the `promote` method of this implementation is called.
This method can perform any business logic (sending alerts, queuing jobs, writing to the database, etc.).
The value of the new lifecycle state is stored in the **Lifecycle State** field of the record.
