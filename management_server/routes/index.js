'use strict';

import user from './user.js'
import project from './project.js'
import sprint from './sprint.js'
import issue from './issue.js'
import issueType from './issueType.js'
import history from './history.js'
import comment from './comment.js'

export default app => {
  app.use('/user', user)
  app.use('/project', project)
  app.use('/sprint', sprint)
  app.use('/issue', issue)
  app.use('/issuetype', issueType)
  app.use('/history', history)
  app.use('/comment', comment)
}
