'use strict';

const St = imports.gi.St;
const Gio = imports.gi.Gio;
const Main = imports.ui.main;
const PanelMenu = imports.ui.panelMenu;

const LABEL_TEXT = 'Toggle Theme Variants (light/dark)';
const SCHEMA_KEY = 'org.gnome.desktop.interface';
const THEME_KEY = 'gtk-theme';
const THEME_DIR = '/usr/share/themes/';
const LIGHT_ICON = 'weather-clear-symbolic';
const DARK_ICON = 'weather-clear-night-symbolic';
/* For Yaru only */
const DAWN_ICON = 'weather-few-clouds-symbolic';
const YARU_NAMES = ['Yaru', 'Communitheme']

var button, settings, themes, icon;

function theme_node(name, icon, next=null) {
    this.name = name;
    this.icon = icon;
    this.next = next;
}

function init() {
	settings = new Gio.Settings({ schema: SCHEMA_KEY });
}

function toggleTheme() {
    var curTheme = settings.get_string(THEME_KEY);
    themes = build_options();

    var theme;
    for (theme of themes) {
        if (!(theme.name === curTheme)) {
            continue;
        }
        if (theme.next) {
            settings.set_string(THEME_KEY, theme.next.name);
            icon.icon_name = theme.next.icon;
        }
    }
}

function enable() {
    var curTheme = settings.get_string(THEME_KEY);
    var icon_name = LIGHT_ICON;

    if (curTheme.includes('Yaru') || curTheme.includes('Communitheme')) {
        themes = build_options();
        var theme;
        for (theme of themes) {
            if (theme.name === curTheme) {
                icon_name = theme.icon;
            }
        }
    }

	icon = new St.Icon({
		icon_name: icon_name,
		style_class: 'system-status-icon'
	});

	button = new PanelMenu.Button(0.0);
	button.actor.add_actor(icon);
	button.actor.connect('button-press-event', toggleTheme);
	Main.panel.addToStatusArea('ToggleDarkTheme', button);
}

function disable() {
	button.destroy();
}

function build_options() {
    var curTheme = settings.get_string(THEME_KEY);
    if (!curTheme) {
        return [];
    }

    var stem = curTheme;
    if (curTheme.endsWith('-dark') || curTheme.endsWith('-light')) {
        stem = curTheme.substring(0, curTheme.lastIndexOf('-'));
    }

    var id = YARU_NAMES.indexOf(stem);
    if (id != -1) {
        var yaru_name = YARU_NAMES[id]

        if (themes && themes[0].name.includes(yaru_name)) {
            // themes already configured
            return themes;
        }

        var light = new theme_node(yaru_name + '-light', LIGHT_ICON);
        var dark = new theme_node(yaru_name + '-dark', DARK_ICON, light);
        var base = new theme_node(yaru_name, DAWN_ICON, dark);
        light.next = base;

        return [base, dark, light];

    }

    // default both variants to current theme
    var light = new theme_node(curTheme, LIGHT_ICON);
    var dark = new theme_node(curTheme, LIGHT_ICON, light);
    light.next = dark;


    if (Gio.File.new_for_path(THEME_DIR.concat(stem)).query_exists(null)) {
        light.name = stem;
    }

    if (Gio.File.new_for_path(THEME_DIR.concat(stem).concat('-dark')).query_exists(null)) {
        dark.name = stem.concat('-dark');
        dark.icon = DARK_ICON;
    }

    return [light, dark];
}

