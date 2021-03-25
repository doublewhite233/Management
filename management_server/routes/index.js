'use strict';

import user from './user.js'
import project from './project.js'

export default app => {
  app.use('/user', user)
  app.use('/project', project)
}
