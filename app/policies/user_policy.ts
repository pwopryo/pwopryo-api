import User from '#models/user'
import { BasePolicy } from '@adonisjs/bouncer'
import { AuthorizerResponse } from '@adonisjs/bouncer/types'

export default class UserPolicy extends BasePolicy {
    index(user: User): AuthorizerResponse {
        return user.role === 'Admin'
    }

    show(user: User, targetUser: User): AuthorizerResponse {
        return user.role === 'Admin' || user.id === targetUser.id
    }

    edit(user: User, targetUser: User): AuthorizerResponse {
        return user.role === 'Admin' || user.id === targetUser.id
    }

    delete(user: User): AuthorizerResponse {
        return user.role === 'Admin'
    }
}