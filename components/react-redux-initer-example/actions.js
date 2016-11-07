/*
    Author: Carl Liu
    Date: Nov 7
    Description: actions.js has all the actions we need for our App
 */
import React, {Component} from 'react'

export const actions = {
    addTodo(text) {
        return {
            type: 'ADD_TODO',
            text: text
        }
    },
    completeTodo(id) {
        return {
            type: 'COMPLETE_TODO',
            id: id
        }
    },
    deleteTodo(id) {
        return {
            type: 'DELETE_TODO',
            id: id
        }
    }
}

