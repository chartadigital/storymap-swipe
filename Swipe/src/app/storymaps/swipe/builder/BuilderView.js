define(["storymaps/swipe/core/WebApplicationData", 
		"storymaps/builder/SettingsPopup",
		"storymaps/utils/Helper",
		// Settings tab
		"storymaps/swipe/builder/SettingsPopupTabDataModel",
		"storymaps/swipe/builder/SettingsPopupTabLayout",
		"storymaps/swipe/builder/SettingsPopupTabLegend",
		"storymaps/swipe/builder/SettingsPopupTabSwipePopup",
		"storymaps/builder/SettingsPopupTabColors",
		"storymaps/builder/SettingsPopupTabHeader",
		"storymaps/builder/SettingsPopupTabExtent"], 
	function (
		WebApplicationData, 
		SettingsPopup,
		Helper,
		SettingsPopupTabDataModel,
		SettingsPopupTabLayout,
		SettingsPopupTabLegend,
		SettingsPopupTabSwipePopup,
		SettingsPopupTabColors, 
		SettingsPopupTabHeader, 
		SettingsPopupTabExtent
		)
	{
		return function BuilderView() 
		{
			var NO_LOGO_OPTION = "NO_LOGO";
			var _settingsPopup = null;
			
			this.init = function(settingsPopup)
			{
				_settingsPopup = settingsPopup;
				dojo.subscribe("SETTINGS_POPUP_SAVE", settingsPopupSave);
			}
			
			//
			// Settings
			//
			
			this.getSettingsTab = function(_tabsBar, _tabContent, _btnSave, params)
			{
				return [
					new SettingsPopupTabLayout(_tabsBar.eq(0), _tabContent.eq(0)),
					new SettingsPopupTabDataModel(_tabsBar.eq(1), _tabContent.eq(1), _btnSave),
					new SettingsPopupTabLegend(_tabsBar.eq(2), _tabContent.eq(2)),
					new SettingsPopupTabSwipePopup(_tabsBar.eq(3), _tabContent.eq(3)),
					new SettingsPopupTabColors(_tabsBar.eq(4), _tabContent.eq(4), params.colorSchemes),
					new SettingsPopupTabHeader(_tabsBar.eq(5), _tabContent.eq(5), params.defaultLogoURL),
					new SettingsPopupTabExtent(_tabsBar.eq(6), _tabContent.eq(6)),
					
				];
			}
			
			this.openSettingPopup = function(fieldsError)
			{
				_settingsPopup.present(
					[
						{
							layout: WebApplicationData.getLayout()
						},
						{
							dataModel : WebApplicationData.getDataModel(),
							layers: WebApplicationData.getLayers(),
							webmaps: WebApplicationData.getWebmaps(),
							layout: WebApplicationData.getLayout()
						},
						{
							legend: WebApplicationData.getLegend(),
							description: WebApplicationData.getDescription(),
							bookmarks: WebApplicationData.getBookmarks()
						},
						{
							popupColors: WebApplicationData.getPopupColors(),
							popupTitles: WebApplicationData.getPopupTitles(),
							layout: WebApplicationData.getLayout()
						},
						{
							colors: WebApplicationData.getColors()
						},
						{
							logoURL: getLogoURL(),
							logoTarget: WebApplicationData.getLogoTarget(),
							linkText: WebApplicationData.getHeaderLinkText() == undefined ? APPCFG.HEADER_LINK_TEXT : WebApplicationData.getHeaderLinkText(),
							linkURL: WebApplicationData.getHeaderLinkURL() == undefined ? APPCFG.HEADER_LINK_URL : WebApplicationData.getHeaderLinkURL(),
							// For the simulator
							colors: WebApplicationData.getColors()
						},
						{
							extent: Helper.getWebMapExtentFromItem(app.data.getWebMapItem().item)
						}
						
					]
				);
			}
	
			function settingsPopupSave(data)
			{
				console.log("settingsPopupSave data = ", data);
				
				var layoutBeforeSave = WebApplicationData.getLayout();
				
				// Layout
				WebApplicationData.setLayout(data.settings[0].layout);
				
				// DataModel
				WebApplicationData.setDataModel(data.settings[1].dataModel);
				WebApplicationData.setWebmaps(data.settings[1].webmaps);
				WebApplicationData.setLayers(data.settings[1].layers);
				
				// UI Layout
				WebApplicationData.setLegend(data.settings[2].legend);
				WebApplicationData.setDescription(data.settings[2].description);
				WebApplicationData.setBookmarks(data.settings[2].bookmarks);
				
				// Popup
				WebApplicationData.setPopupColors(data.settings[3].popupColors);
				WebApplicationData.setPopupTitles(data.settings[3].popupTitles);
				
				// Colors
				WebApplicationData.setColors(data.settings[4].colors[0], data.settings[4].colors[1]);
				
				// Header	
				WebApplicationData.setHeaderLink(data.settings[5].linkText, data.settings[5].linkURL);
	
				var logoURL = data.settings[5].logoURL;
				if (logoURL) {
					if (logoURL == APPCFG.HEADER_LOGO_URL)
						WebApplicationData.setLogoURL(null);
					else 
						WebApplicationData.setLogoURL(logoURL);
				}
				else {
					WebApplicationData.setLogoURL(NO_LOGO_OPTION);
				}
				WebApplicationData.setLogoTarget(data.settings[5].logoTarget);
				
				// Extent
				var extent = Helper.serializeExtentToItem(data.settings[6].extent);
				if( ! Helper.serializedExtentEquals(extent, app.data.getWebMapItem().item.extent) ) {
					app.data.getWebMapItem().item.extent = extent;
					app.data.initialExtentHasBeenEdited = true;
				}
				
				if( layoutBeforeSave == "swipe" )
					app.mapSwipe.updateSettings(WebApplicationData.getPopupColors(), WebApplicationData.getPopupTitles());
				else
					app.spyGlass.updateSettings(WebApplicationData.getPopupColors(), WebApplicationData.getPopupTitles());
				
				dojo.publish("BUILDER_INCREMENT_COUNTER", 1);
				dojo.publish("CORE_UPDATE_UI");
			}
			
			this.resize = function()
			{
				//
			}
			
			function getLogoURL()
			{
				var logoURL = WebApplicationData.getLogoURL();
				
				if ( ! logoURL )
					logoURL = APPCFG.HEADER_LOGO_URL;
				else if ( logoURL == NO_LOGO_OPTION )
					logoURL = null;
				
				return logoURL;
			}
		}
	}
);