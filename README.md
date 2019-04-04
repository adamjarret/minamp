# minamp

A minimal [AMP](https://ampproject.org) compatible theme for [Hugo](https://gohugo.io).

The minamp theme is intended to be a __blank canvas__ for AMP sites.
It is focused on __versatility__ and reducing the pain of loading styles and
__AMP component scripts from different scopes__.

See the [example site](https://github.com/adamjarret/minamp-demo)
and the [live demo](https://adamjarret.github.io/minamp-demo).

## Installation

Add this repository as a submodule to your hugo site repo:

    git submodule add https://github.com/adamjarret/minamp themes/minamp

Edit your config file (ex. __config.toml__):

    theme = "minamp"

    # Prevent hugo server from injecting JS into the page in dev env (breaks AMP validation via browser plugin)
    disableLiveReload = true

    # The <meta charset="utf-8"> element should be the first element in <head>
    #	Instead of injecting, {{ .Hugo.Generator }} is included explicitly in layouts/partials/head/other.html
    disableHugoGeneratorInject = true

## Usage

### Insert an Image

In a content file:

    {{< amp-image src="//via.placeholder.com/350x150" width="350" height="150" layout="responsive" >}}

In a layout file:

    {{ partial "amp/image" (dict "src" "//via.placeholder.com/350x150" "width" "350" "height" "150" "layout" "responsive") }}

### Customizing Styles

AMP only allows
[50KB of CSS per HTML page](https://www.ampproject.org/docs/reference/validation_errors#stylesheet-too-long)
and places restrictions on how CSS is loaded and what styles are supported.

From the [AMP documentation](https://www.ampproject.org/docs/guides/responsive/style_pages.html):

> Like all web pages, AMP pages are styled with CSS, but you can’t reference external stylesheets
> (with the exception of custom fonts).
> Also certain styles are disallowed due to performance implications; inline style attributes aren't allowed.
> __All styles must live in the head of the document__...

#### Global Styles

To override the CSS that is included in every page, override the __assets/sass/styles.scss__ file.

#### Page Specific Styles

Layouts can define the `"css"` block to include page specific styles.

    {{ define "css" }}
    h2 {
        margin-top: 64px;
    }
    {{ end }}

### Lodaing AMP Components

AMP components must be loaded via `<script>` tag in the `<head>` before they can be used.
AMP validation requires that all loaded elements must be used.

When using this theme, components can be referenced by their
[AMP custom-element name](https://github.com/adamjarret/minamp/blob/master/data/amp/src.json) 
and can be loaded globally, for a specific layout and/or a specific content file.

#### Global Components

Global components will be loaded on every page.

##### Automatic

The following components are loaded automatically:

* `amp-core`
* `amp-analytics` _(only loaded if `googleAnalytics` param is set in the Hugo config)_

##### Specified in Data File

The theme will load AMP components specified in __data/amp/components.toml__ file.

```toml
global = ["amp-sidebar"]
```

##### Specified in Hugo Config

Globally loaded AMP components can also be specified using the `ampComponentsGlobal` param in the Hugo config.
This can be useful when an AMP component should be conditionally included at build time based on the environment.
Components in this list will be loaded in _addition_ to those specified in data files.

```toml
[params]
ampComponentsGlobal = ["amp-form", "amp-accordion"]
```

#### Layout Components

To load one or more AMP components on every page built with a certain layout,
implement the "scratch" block in the layout file.

```tpl
{{ define "scratch" }}
  {{- $.Scratch.Add "ampComponents" (slice "amp-animation") -}}
  {{- $.Scratch.Add "ampComponents" (slice "amp-position-observer") -}}
{{ end }}
```

Note: This only works for layouts that inherit from `baseof` (i.e. not partials).

#### Content Components

Content files can specify the AMP components they require in frontmatter.

```toml
ampComponents = ["amp-youtube"]
```
