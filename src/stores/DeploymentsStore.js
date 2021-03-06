/*
  Copyright 2015 Skippbox, Ltd

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
*/
import alt from 'src/alt';
import DeploymentsActions from 'actions/DeploymentsActions';
import immutableUtil from 'alt-utils/lib/ImmutableUtil';
import BaseEntitiesStore from './BaseEntitiesStore';

const entityType = 'deployments';

class DeploymentsStore extends BaseEntitiesStore {

  constructor() {
    super({entityType, persistent: true});
    this.bindActions(DeploymentsActions);
  }

  onScaleDeploymentStart({cluster, deployment, replicas}) {
    this.setState(this.state.setIn(['deployments', cluster.get('url'), deployment.getIn(['metadata', 'uid']), 'spec', 'replicas'], replicas));
  }

  onScaleDeploymentSuccess({cluster, deployment}) {
    this.setState(this.state.setIn(['deployments', cluster.get('url'), deployment.getIn(['metadata', 'uid'])], deployment.set('kind', entityType)));
  }

  onRollingUpdateStart({cluster, deployment, image}) {
    this.setState(this.state.setIn(['deployments', cluster.get('url'), deployment.getIn(['metadata', 'uid']), 'spec', 'template', 'spec', 'containers', 0, 'image'], image));
  }

  onRollingUpdateSuccess({cluster, deployment}) {
    this.setState(this.state.setIn(['deployments', cluster.get('url'), deployment.getIn(['metadata', 'uid'])], deployment));
  }

  static getDeploymentReplicas({cluster, deployment}) {
    return alt.stores.ReplicaSetsStore.getAll(cluster).filter(replica => {
      return replica.getIn(['metadata', 'labels', 'run']) === deployment.getIn(['metadata', 'name']);
    });
  }
}

export default alt.createStore(immutableUtil(DeploymentsStore), 'DeploymentsStore');
