import React from 'react';
import jsyaml from 'js-yaml';
import { GeneratedCodeContainer } from './GeneratedCodeContainer';
import { ApolloRestDataSourceGeneratorV2 } from './ApolloRestDataSourceGeneratorV2';
import { cacheGetItems } from './lib';

const placeHolder = 'note: please copy/paste OpenAPI v3 spec (YAML) here';
const cacheKeys   = ['serviceName', 'serviceConfigKey', 'openApiYaml'];

const STAGE_LOADING    = 'loading';
const STAGE_READY      = 'ready';
const STAGE_GENERATING = 'generating';

const initialState = {
  stage: STAGE_LOADING,
  serviceName: 'Accounts',
  serviceConfigKey: 'accounts',
  openApiYaml: placeHolder,
  error: '',
  generatedCode: null,
};

/*
const AT_CHANGE_STAGE = 'change-stage';
const AT_CHANGE_DATA  = 'change-data';

export function appReducer(state, action) {
  switch (action.type) {
    case AT_CHANGE_STAGE:
      return { ...state, stage: action.stage, ...(action.data || {}) };
    case AT_CHANGE_DATA:
      return { ...state, [action.name]: action.value };
    default:
      console.warn('unknown action.type', action);
      return { ...state };
  }
}

export function actionChangeStage(stage, data = {}) {
  return { type: AT_CHANGE_STAGE, stage, data };
}

export function actionChangeData(name, value) {
  return { type: AT_CHANGE_DATA, name, value };
}
*/

class App extends React.Component {
  constructor(props){
    super(props);
    this.state = { ...initialState };
  }
  
  async componentDidMount() {
    const change = { stage: STAGE_READY };
    const cachedData = await cacheGetItems(this.props.cache, cacheKeys);
    this.setState({ ...change, ...cachedData });
  }

  onChange = e => {
    const { name, value } = e.target;
    this.props.cache.setItem(name, value); // on refresh/reload it helps speed up process
    this.setState({ [name]: value, api: null } ); // reset API spec obj
  }

  onSpecFocus = e => {
    if (e.target.value === placeHolder) { // our prompt
      this.setState({ openApiYaml: '' }); // clean textarea, ready for copy/paste
    }
  }

  onSpecBlur = e => {
    if (e.target.value === '') { // no content
      this.setState({ openApiYaml: placeHolder }); // copy prompt back
    }
  }

  onSubmit = async (evt) => {
    evt.preventDefault(); // we are not really submitting the form
    let rawApi = null, generatedCode = null, error = null;
    const { serviceName, serviceConfigKey } = this.state;
    this.setState({ error, stage: STAGE_GENERATING });
    try {
      rawApi = jsyaml.load(this.state.openApiYaml);
      console.log('rawApi', rawApi);
      const g = new ApolloRestDataSourceGeneratorV2(serviceName, serviceConfigKey, rawApi);
      generatedCode = g.generate();
    } catch (err) {
      console.error(err);
      error = err.message;
    }
    this.setState({ generatedCode, error, stage: STAGE_READY });
  }
  
  renderForm = () => {
    const { stage, serviceName, serviceConfigKey } = this.state;
    if (stage !== STAGE_READY) return null;
    return (
      <form onSubmit={this.onSubmit}>
        <div>
          <label htmlFor='serviceName'>Service prefix: </label>
          <input type='text' id='serviceName' name='serviceName' value={serviceName} onChange={this.onChange} />&nbsp;
          <label htmlFor='serviceConfigKey'>Config key:</label>
          <input type='text' id='serviceConfigKey' name='serviceConfigKey' value={serviceConfigKey} onChange={this.onChange} />&nbsp;
          <button type="submit">Generate</button>
        </div>
        <div>
          <textarea
            id='openApiYaml' name='openApiYaml' value={this.state.openApiYaml} 
            onChange={this.onChange} onFocus={this.onSpecFocus} onBlur={this.onSpecBlur}
          />
        </div>
      </form>
    )
  }

  renderGenerator = () => {
    const { stage, serviceName, serviceConfigKey, generatedCode } = this.state;
    if (stage !== STAGE_READY) return null;
    const genProps = { serviceName, serviceConfigKey, generatedCode };
    return (
      <div className='generator'>
        <GeneratedCodeContainer {...genProps} />
      </div>
    )
  }

  renderLoading = () => {
    if (this.state.stage === STAGE_LOADING) return (<div>Loading...</div>)
    return null;
  }

  renderGenerating = () => {
    if (this.state.stage === STAGE_GENERATING) return (<div>Generating...</div>)
    return null;
  }

  renderError = () => {
    if (this.state.error) return (<div className='generator error'>{this.state.error}</div>)
    return null;
  }

  render(){
    return (
      <>
        {this.renderLoading()}
        {this.renderGenerating()}
        {this.renderForm()}
        {this.renderError()}
        {this.renderGenerator()}
      </>
    )
  }
}

export default App;
