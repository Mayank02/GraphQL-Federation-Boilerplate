import React from 'react';

export class GeneratedCodeContainer extends React.Component {
  
  constructor(props) {
    super(props);
    this.myTextAreaRef = React.createRef();
  }

  onCopy = (evt) => {
    const domNode = this.myTextAreaRef.current;
    domNode.select();
    document.execCommand('copy');
  }

  render() {
    const textProps = {
      ref: this.myTextAreaRef,
      className: 'codeToCopy',
      defaultValue: this.props.generatedCode,
    };
    return (
      <>
        <div className='header'>
          <button type='button' onClick={this.onCopy}>Copy</button>
        </div>
        <div><textarea {...textProps} readOnly /></div>
      </>
    );
  }
}
