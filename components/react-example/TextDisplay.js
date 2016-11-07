import React, {Component} from 'react'

class TextDisplay extends Component {
    render(){
        return (
            <div>
                {this.props.text}
            </div>
        )
    }
}

export default TextDisplay