# import os
# import sys
# sys.path.insert(0, os.path.abspath('.'))

import f5_sphinx_theme


project = 'Content As Code'
copyright = ''
author = 'Robin Mordasiewicz'

# The full version, including alpha/beta/rc tags
release = '20220608'

# -- General configuration ---------------------------------------------------

# Add any Sphinx extension module names here, as strings. They can be
# extensions coming with Sphinx (named 'sphinx.ext.*') or your custom
# ones.
extensions = [
    "sphinxcontrib.youtube",
    "sphinx_copybutton",
    "sphinxcontrib.mermaid",
    "sphinx-favicon",
    "sphinxcontrib.video"
]

# Add any paths that contain templates here, relative to this directory.
templates_path = ['_templates']

# List of patterns, relative to source directory, that match files and
# directories to ignore when looking for source files.
# This pattern also affects html_static_path and html_extra_path.
exclude_patterns = ['_build', 'Thumbs.db', '.DS_Store']


# -- Options for HTML output -------------------------------------------------

# The theme to use for HTML and HTML Help pages.  See the documentation for
# a list of builtin themes.
#
#html_theme = ''

#html_sidebars = {'**': ['searchbox.html', 'localtoc.html', 'globaltoc.html']}

#html_theme_options = {
#                        'site_name': 'Solutions',
#                        'next_prev_link': True,
#                        'html_last_updated_fmt': '%Y-%m-%d %H:%M:%S'
#                        # 'base_url' = ''                            \\ DEFAULTS TO '/'
#                     }

#html_theme_options = {
#  'version_selector': True,
#}

html_theme = "f5_sphinx_theme"
html_theme_path = f5_sphinx_theme.get_html_theme_path()
html_sidebars = {"**": ["searchbox.html", "localtoc.html", "globaltoc.html"]}
html_theme_options = {
    "site_name": "CNF",
    "next_prev_link": True
}

#html_last_updated_fmt = "%Y-%m-%d %H:%M:%S"

# Add any paths that contain custom static files (such as style sheets) here,
# relative to this directory. They are copied after the builtin static files,
# so a file named "default.css" will overwrite the builtin "default.css".
html_static_path = ['_static']

copybutton_copy_empty_lines = False
copybutton_prompt_text =r'\$ '
copybutton_prompt_is_regexp = True
copybutton_remove_prompts = True
copybutton_line_continuation_character = "\\"
copybutton_only_copy_prompt_lines = True

# The name of the Pygments (syntax highlighting) style to use.
pygments_style = "sphinx"
html_copy_source = False
