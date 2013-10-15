### A Wintersmith plugin. ###

fs = require 'fs'
path = require 'path'

replaceAll = (string, map) ->
  re = new RegExp Object.keys(map).join('|'), 'gi'
  return string.replace re, (match) -> map[match]

module.exports = (env, callback) ->
  # *env* is the current wintersmith environment
  # *callback* should be called when the plugin has finished loading

  mcpTemplateView = (env, locals, contents, templates, callback) ->
    ### Content view that expects content to have a @template instance var that
        matches a template in *templates*. Calls *callback* with output of template
        or null if @template is set to 'none'. ###

    if @template == 'none'
      return callback null, null

    template = templates[@template]
    if not template?
      callback new Error "page '#{ @filename }' specifies unknown template '#{ @template }'"
      return

    ctx = {page: this}
    env.utils.extend ctx, locals

    template.render ctx, callback

  class MCPage extends env.ContentPlugin
    ### Prepends 'Wintersmith is awesome' to text files. ###

    constructor: (@filepath, @template, @mcpdata) ->

    getFilename: ->
      dirname = path.dirname @filepath.relative
      basename = path.basename @filepath.relative
      ext = path.extname basename

      filename = replaceAll basename,
        '.mcp': ''
        '.json': '.html'

      return path.join dirname, filename

    getUrl: (base) ->
      # remove index.html for prettier links
      super(base).replace /index\.html$/, ''

    getView: ->
      'mcptemplate'

  MCPage.fromFile = (filepath, callback) ->
    env.utils.readJSON filepath.full, (error, mcpdata) ->
      if not error?
        locals = env.utils.readJSONSync mcpdata.locals
        plugin = new MCPage filepath, mcpdata.template, locals
      callback error, plugin

  env.registerView 'mcptemplate', mcpTemplateView

  env.registerContentPlugin 'mcp', '**/*.mcp.json', MCPage

  # tell plugin manager we are done
  callback()
