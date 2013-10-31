### A Wintersmith plugin. ###

fs = require 'fs'
path = require 'path'
_ = require 'underscore'

replaceAll = (string, map) ->
  re = new RegExp Object.keys(map).join('|'), 'gi'
  return string.replace re, (match) -> map[match]

readPodcastFile = (f) ->
  file = fs.readFileSync f, 'utf8'
  lines = file.split '\n'
  data = {}
  i = 0
  for line in lines
    eq = line.indexOf '='
    if eq > 0
      data[line.substring(0,eq).trim().toLowerCase()] =
        line.substring(eq+1).trim()
      i += 1
    else
      break
  data.contents = replaceAll(lines.slice(i).join('\n').trim(),
    '\n':'<br/>')
  data

setPodcastLocals = (locals, root_path) ->
  unless locals.podcasts
    files = fs.readdirSync root_path
    locals.podcasts = _.reduce(files, ((memo, val) ->
      d = root_path+'/'+val
      if (fs.statSync d).isDirectory()
        cover = val+'/'+_.find(fs.readdirSync(d),
          (f)->f.match(/.jpg$|.png$|.jpeg$|.gif$/).length > 0)
        memo.push _.extend(readPodcastFile(d+'/metadata.txt'),
          cover:cover
          url:val)
        memo
      else
        memo), []
    )
    locals.podcasts = _.sortBy(locals.podcasts, (n)->-n.url)

module.exports = (env, callback) ->
  # *env* is the current wintersmith environment
  # *callback* should be called when the plugin has finished loading

  podcastTemplateView = (env, locals, contents, templates, callback) ->
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

  class Podcasts extends env.ContentPlugin
    constructor: (@filepath, @template, @mcpdata) ->

    getFilename: ->
      dirname = path.dirname @filepath.relative
      basename = path.basename @filepath.relative
      ext = path.extname basename

      filename = replaceAll basename,
        '.podcast': ''
        '.json': '.html'

      return path.join dirname, filename

    getUrl: (base) ->
      # remove index.html for prettier links
      super(base).replace /index\.html$/, ''

    getView: ->
      'podcastTemplate'

  Podcasts.fromFile = (filepath, callback) ->
    env.utils.readJSON filepath.full, (error, mcpdata) ->
      if not error?
        unless env.locals.podcasts
          setPodcastLocals env.locals, mcpdata.dir
        plugin = new Podcasts filepath, mcpdata.template,
          env.locals.podcasts[0]
      callback error, plugin

  class Podcast extends env.ContentPlugin
    constructor: (@filepath, @template, @mcpdata) ->

    getFilename: ->
      dirname = path.dirname @filepath.relative
      basename = path.basename @filepath.relative
      ext = path.extname basename

      filename = replaceAll basename,
        'metadata.txt': 'index.html'

      return path.join dirname, filename

    getUrl: (base) ->
      # remove index.html for prettier links
      super(base).replace /index\.html$/, ''

    getView: ->
      'podcastTemplate'

  Podcast.fromFile = (filepath, callback) ->
    unless env.locals.podcasts
      p = filepath.full.replace(/[^\/]*?\/[^\/]*?$/, '')
      setPodcastLocals env.locals, p

    dir = filepath.full.replace(/[^\/]*$/, '')
    dir_name = dir.match(/[^\/]*\/$/, '')[0].replace('/', '')

    cover = dir_name+'/'+_.find(fs.readdirSync(dir),
            (f)->f.match(/.jpg$|.png$|.jpeg$|.gif$/).length > 0)

    page_data = _.extend(readPodcastFile(filepath.full),
      cover:cover
      url:dir_name)

    plugin = new Podcast filepath, 'podcasts.jade',
      page_data
    callback null, plugin

  env.registerView 'podcastTemplate', podcastTemplateView

  env.registerContentPlugin 'podcasts', '**/*.podcast.json', Podcasts
  env.registerContentPlugin 'podcast', '**/metadata.txt', Podcast

  # tell plugin manager we are done
  callback()
