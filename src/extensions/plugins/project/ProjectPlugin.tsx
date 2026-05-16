import {Plugin} from "../Plugin"
import {ProjectGantt} from "./components"
import {Project} from "./components/ProjectGantt/types"

const PROJECT_GANTT_COMPONENT_ID = "projectGantt"

export class ProjectPlugin extends Plugin<Project> {
  override onLoad() {
    this.addComponent({
      id: PROJECT_GANTT_COMPONENT_ID,
      mountPoint: "project.tabs.end",
      priority: 10,
      title: "Gantt Chart",
      icon: "FaChartGantt",
      render: ({context}) => <ProjectGantt key={PROJECT_GANTT_COMPONENT_ID} {...context} />
    })
  }

  override onUnload() {
    throw new Error("Method not implemented.")
  }
}
