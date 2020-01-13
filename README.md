# minamp

A minimal [AMP](https://ampproject.org) compatible theme for [Hugo](https://gohugo.io).

The minamp theme is intended to be a **blank canvas** for AMP sites.
It is focused on **versatility** and reducing the pain of loading styles and
**AMP component scripts from different scopes**.

See the [example site](https://github.com/adamjarret/minamp-demo)
and the [live demo](https://adamjarret.github.io/minamp-demo).

Note: The [extended](https://gohugo.io/news/0.43-relnotes/#notes)
version of Hugo is required to use this theme (because SCSS files are used).

## Installation

Add this repository as a submodule to your hugo site repo:

    git submodule add https://github.com/adamjarret/minamp themes/minamp

Edit your config file (ex. **config.toml**):

    theme = "minamp"

    # [REQUIRED] Prevent hugo server from injecting JS into the page in dev env (breaks AMP validation via browser plugin)
    disableLiveReload = true

    # [RECOMMENDED] The <meta charset="utf-8"> element should be the first element in <head>
    #	Instead of injecting, {{ hugo.Generator }} is included explicitly in layouts/partials/head/other.html
    disableHugoGeneratorInject = true

    # [RECOMMENDED] Allow HTML in markdown files (otherwise all AMP elements must be rendered using shortcodes/partials)
    [markup.goldmark.renderer]
        unsafe = true

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
> **All styles must live in the head of the document**...

#### Global Styles

To override the CSS that is included in every page, override the **assets/sass/styles.scss** file.

#### Page Specific Styles

Layouts can define the `"css"` block to include page specific styles.

    {{ define "css" }}
    h2 {
        margin-top: 64px;
    }
    {{ end }}

### Loading AMP Components

AMP components must be loaded via `<script>` tag in the `<head>` before they can be used.
AMP validation requires that all loaded elements must be used.

When using this theme, components can be referenced by their
[AMP custom-element name](https://github.com/adamjarret/minamp/blob/master/data/amp/src.json)
and can be loaded globally, for a specific layout and/or a specific content file.

#### Global Components

Global components will be loaded on every page.

##### Automatic

The following components are loaded automatically:

- `amp-core`
- `amp-analytics` _(only loaded if `googleAnalytics` param is set in the Hugo config)_

##### Specified in Data File

The theme will load AMP components specified in **data/amp/components.toml** file.

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
