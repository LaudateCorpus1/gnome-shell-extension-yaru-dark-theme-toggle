'use strict';

const St = imports.gi.St;
const Gio = imports.gi.Gio;
const Main = imports.ui.main;
const PanelMenu = imports.ui.panelMenu;

const LABEL_TEXT = 'Toggle Yaru variants';
const SCHEMA_KEY = 'org.gnome.desktop.interface';
const THEME_KEY = 'gtk-theme';

var button, settings, themes, icon;

function theme_node(name, icon, next=null) {
    this.name = name;
    this.icon = icon;
    this.next = next;
}

function init() {
	settings = new Gio.Settings({ schema: SCHEMA_KEY });
    var yaru_light = new theme_node('Yaru-light', 'weather-clear-symbolic');
    var yaru_dark = new theme_node('Yaru-dark', 'weather-clear-night-symbolic', yaru_light);
    var yaru = new theme_node('Yaru', 'weather-few-clouds-symbolic', yaru_dark);
    yaru_light.next = yaru;

    themes = [ yaru, yaru_dark, yaru_light ];
}

function toggleTheme() {
    const curTheme = settings.get_string(THEME_KEY);
    if (!curTheme || !curTheme.includes('Yaru')) {
        return;
    }

    var theme;
    for (theme of themes) {
        if (!(theme.name === curTheme)) {
            continue;
        }
        settings.set_string(THEME_KEY, theme.next.name);
        icon.icon_name = theme.next.icon;
    }
}

function enable() {
    var curTheme = settings.get_string(THEME_KEY);
    var icon_name = 'weather-clear-night-symbolic';

    if (curTheme.includes('Yaru')) {
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

