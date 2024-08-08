import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

export default class UserVerificationMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    /**
     * Middleware logic goes here (before the next call)
     */
    if (!ctx.auth.user?.isVerified) {
      return ctx.response.unauthorized({
        message: "L'utilisateur n'est pas vérifié"
      })
    }
    /**
     * Call next method in the pipeline and return its output
     */
    await next()
  }
}