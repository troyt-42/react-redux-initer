/*
 Author: Carl Liu
 Date: Nov 7
 Description: App.js is the main index page
 */

import React from 'react'
import initer from 'initer/initer'
import reducer from './reducer'
import { actions } from './actions'
import TodoInput from './TodoInput'
import TodoItem from './TodoItem'

//start our reducer by doing initer.injectReducer, lets call it myReducer
initer.injectReducer('myReducer',reducer);

module.exports = initer.bindApp({
    mapStateToProps: state=> {
        return {
            todos: state.myReducer.todos
        }
    },
    bindActions: {
        addTodo:actions.addTodo,
        completeTodo:actions.completeTodo,
        deleteTodo: actions.deleteTodo
    },
    bindClass: React.createClass({
        componentWillMount(){},
        componentDidMount(){},
        componentWillUnmount(){},
        render(){
            const {todos,...props} = this.props;
            var actions={
                addTodo:this.props.addTodo,
                completeTodo:this.props.completeTodo,
                deleteTodo: this.props.deleteTodo
            }
            return <div>
                <h1>Todo List</h1>
                <TodoInput {...props}/>
                <ul>
                    {
                        todos.map((todo) => {
                            return <TodoItem key={todo.id} todo={todo} actions={actions}/>
                        })
                    }
                </ul>
            </div>
        }
    })
})