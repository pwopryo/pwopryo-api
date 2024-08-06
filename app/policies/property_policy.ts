import User from '#models/user'
import Property from '#models/property'
import { BasePolicy } from '@adonisjs/bouncer'
import { AuthorizerResponse } from '@adonisjs/bouncer/types'

export default class PropertyPolicy extends BasePolicy {
    create(): AuthorizerResponse {
        return true
    }

    edit(user: User, property: Property): AuthorizerResponse {
        return user.id === property.userId || user.role === "Admin"
    }

    delete(user: User, property: Property): AuthorizerResponse {
        return user.id === property.userId || user.role === "Admin"
    }
}