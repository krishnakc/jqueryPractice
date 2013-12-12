/* $HeadURL$
 * Created on Jan 5, 2011 by pruhil
 * $Revision$
 * $Id$
 * $LastChangedDate$
 * $LastChangedBy$
 * Copyright (c) 2011 Sapient India Pvt. Ltd.  All rights reserved.
 */

// Variables for attaching and deatching next and prev link.
var attachNext;
var attachPrev;

var errorInResponseCheck = false;
var colWidth = '140px'; /*RS June29 */
var tableWidth = 164; /*RS June29 */

//DCR path has been removed since it over writes the original value when calls are made onload.
//var dcrPath = '';

// Used to store the display type (flat/group/tab) in case of Learn More link
var displayType = '';

// Total Learn More links present on features
var totalLearnMoreLink;

var manufactureMap = new HashMap();

//Current Learn More selected
var currentLearnMore;

// Xml Response to pass to dynamic functions
var xmlResponse;

// Object containing information whether next is clicked or previous is clicked
var nextPrevObject;

// To check whether request comes from next prev link.
var isNextPrevLink = false;

// To check whether it is for the first time learn more link is clicked
var isFirstLearnMore = false;

// To check whether the lightbox iframe tag is inserted into the html body or not.
var isFirstTimeIframe = false;

// To check whether the first tab is expanded in case of tab content of features and specs.
var isFirstTabExpanded = false;

// Map to store the xml response for caching the ajax request.
var cachingMap = new HashMap();

// Map to store the div's Id for display the loadingGif by inserting the images in the div.
var loadingGifMap = new HashMap();



//This map will contains the base code key and description.
var baseCodeMap = new HashMap();

// This map contains the base codes with the key as description in case of base code xml returned in compare
var compareBaseCodeMap = new HashMap();

//To hold the current position for pagination
var current = 0;

var currDot = 0;

//HashMap to hold the model names

var model_namesCache = new HashMap();

// To store basecode for caching basecode and their respective specifications
var basecode = null; 
/*
 * This variable is used in caching compare specs when there are multiple base codes present, so caching
 * will be 'basecode'+compareSpecs, so that each compare specifications is cached.
 */
var baseCodeCompareSpecs = null;

//Temporary variable for specifications and Compare Export to excel
var tempCompBaseCode = null;
var tempSpecsBaseCode = null;

//Hold the total pages for pagination
var ttl_page = 0;

var columns;

var rows=0;

var seriesXML='';
var showModels = new HashMap();

//This error Map will hold contains the divs where error message is to inserted
var errorMap = new HashMap();

// Map to store status of ajax request done.
var checkAjaxRequestMap = new HashMap();

// Variable to store the request made from which tab
var whichTab = "";

// This variables store the script in case of compatible tab
var storeCompScript = "";
var userAgent = navigator.userAgent.toLowerCase();

// This variable is used in specifications. It checks whether the request is made from intermediate screen or not. 
var fromBaseCode = false;

//This variable is used in Compare. It checks whether the request is made from intermediate screen or not.
var fromCompareBaseCode = false;

// This variable is used to in case of compare to check weather multiple base code exist or not.
var isMultipleBaseCodeExistCompare = false;

var currentRTable = {
	currentTab: 'null',
	rTableArr: 'null',
	scrollTableArr: 'null',
	scrollColNum: 'null',
	thArr: 'null',
	currentTabAddRemove: 'null',
	currentTabBaseCode:'null'
}

var compareModalsArr = ',';

// This variable holds the models to get the specifications in excel sheet
var modelsToExport = '';

// This variable holds all the models to get the specifications in excel sheet
var allModelsToExport = '';

// This variable holds the inital request url for export to excel specification in case of compare tab
var exportToExcelUrl = '';

// Export to PDF label
var exportToPdf;

// Export to PDF label, default value
var exportToPdfDefaultLabel = 'Export to PDF';

//Figure out what browser is being used
var browser = {
	version: (userAgent.match( /.+(?:rv|it|ra|ie|me)[\/: ]([\d.]+)/ ) || [])[1],
	chrome: /chrome/.test( userAgent ),
	safari: /webkit/.test( userAgent ) && !/chrome/.test( userAgent ),
	opera: /opera/.test( userAgent ),
	msie: /msie/.test( userAgent ) && !/opera/.test( userAgent ),
	mozilla: /mozilla/.test( userAgent ) && !/(compatible|webkit)/.test( userAgent )
	};
// Get the enviorment and call respective enviornment


/* Ready function to trigger the execution of code once the DOM tree, but no external image resources has loaded.
 * It cover the click event on Features, Specifications, Learn More and Next Prev links to trigger the event
 * before the loading of image.
 */
$(document).ready(function(){
	/*RS June29 */
	if(leftNavPage){
		colWidth = '131px';
		tableWidth = 155;
	}
	/* RS WCAG */
	$('body').delay('#pager a', 'keypress', function(){
		$(this).trigger('click');
	});
	$('.MOD_FO_6b h3:first').addClass("open");
	
	/*DD Removed hierarchy as per Dax (.feature .inner) as seeallfeatures and specs was required through Content as well.*/
	// Called on click of features tab
	$('li.features, a#seeallfeatures').click(function(){
		getFeatures();
	
	});

	// Called on click on Specifications Tab
	$('li.specifications , a#seeallspecs').click(function(){
		getSpecification();
	});

	
	// Called on click of Compatible tab
	$('li.compatible').click(function(){
		getCompatible();
	});
	
	// Called on click of Compare tab
	$('li.compare').click(function(){
		getCompare();
		
	});
	
	// Load the localisation script

	loadLocalisationScript();

	// Ajax Request using URLS
	var parameter  = getRequestParamter( "tab" );
	if(parameter == "features"){
		getFeatures();
		onProductTab("features");
	}else if (parameter == "specifications"){
		getSpecification();
		onProductTab("specifications");
	}
	else if (parameter == "support"){
		onProductTab("support");
	}
	else if (parameter == "wild"){
		onProductTab("wild");
	}
	else if (parameter == "wild2"){
		onProductTab("wild2");
	}
	else if (parameter == "overview"){
		onProductTab("overview");
	}
	else if (parameter == "compare"){
		onProductTab("compare");
		getCompare();
	}
	else if (parameter == "compatible"){
		onProductTab("compatible");
		getCompatible();
		}
});

/**
 * This functions load the localization JavaScript file if they are not loaded on the page
 */
function loadLocalisationScript(){
	if(typeof ExpandAll=="undefined"){
		$.localise.defaultLanguage;
		path = '/common/deere-resources/js/locale';
		$.localise(path, {language: localeString, loadBase: true});
		var localeString = getStringPart('/', 5);
		path = '/'+localeString+'/deere-resources/js/locale';
		$.localise(path, {language: localeString, loadBase: true});	
	}
}

/**
 * This function gives the request parameters from the browser URL.
 * @param name : Parameter value to be found
 * @returns
 */
function getRequestParamter( name )
{
  name = name.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
  var regexS = "[\\?&]"+name+"=([^&#]*)";
  var regex = new RegExp( regexS );
  var results = regex.exec( window.location.href );
  if( results == null )
    return "";
  else
    return results[1];
}

/**
 * Function to get the features of the product model
 */
function getFeatures(){
	if(typeof runtime_env=="undefined"){
		runtime_env = "live";
	}
	// Prepare the request map
		var reqMapFeat = {'dcr_path':dcrPath,'id':'features'};

		loadingGifMap.set('type','div.features');
		errorMap.set('type','features');
		if(checkAjaxRequestMap.get('features')!='second'){
			checkAjaxRequestMap.set("features", "first");
		}
		whichTab = 'features';
		getContent(reqMapFeat,"/wps/PA_crp_"+runtime_env+"/getFeaturesData",'features');
}

/**
 * Function to get the Specifications of the Product model
 */
function getSpecification(){
	if(typeof runtime_env=="undefined"){
		runtime_env = "live";
	}
		
	var reqMapSer = {'dcr_path':dcrPath,'id':'specifications'};

	loadingGifMap.set('type','div.specifications');
	errorMap.set('type','specifications');
	if(checkAjaxRequestMap.get('specifications')!='second'){
		checkAjaxRequestMap.set("specifications", "first");
	}
	fromBaseCode=false;
	whichTab = 'specifications';
	getContent(reqMapSer,"/wps/PA_crp_"+runtime_env+"/getSpecsData",'specifications');
}

/**  
 *  This function returns the compare tab result.
 */
function getCompare(){
	if(typeof runtime_env=="undefined"){
			runtime_env = "live";
	}
	
	// Prepare the request map
	var reqMapFeat = {'dcr_path':dcrPath,'id':'compare'};
	loadingGifMap.set('type','div.compare');
	errorMap.set('type','compare');
		
	if(checkAjaxRequestMap.get('compare')!='second'){
		checkAjaxRequestMap.set("compare", "first");
	}
	fromCompareBaseCode = false;
	whichTab = 'compare';
	getContent(reqMapFeat,"/wps/PA_crp_"+runtime_env+"/getCompareProductData",'compare');
}

/**
 *  This function is called on click of Compatible Equipment Tab
 */
function getCompatible(){
	if(typeof runtime_env=="undefined"){
		runtime_env = "live";
	}
	// Prepare the request map
	var reqMapFeat = {'dcr_path':dcrPath,'id':'compatible'};
	loadingGifMap.set('type','div.compatible');
	errorMap.set('type','compatible');
	if(checkAjaxRequestMap.get('compatible')!='second'){
		checkAjaxRequestMap.set("compatible", "first");
	}
	whichTab = 'compatible';
	
	getContent(reqMapFeat,"/wps/PA_crp_"+runtime_env+"/getCompatibleTabData",'compatible');
}
/**
* This method is called when clicked on Export Comparison to xls in case of compare specifictions.
*/
function exportComparisonClick($this,modelsToExport){

	if(modelsToExport==''){
		if(tempCompBaseCode==null || tempCompBaseCode == ''){
			$this.href = exportToExcelUrl+'dcr_path='+dcrPath+'&modelId='+allModelsToExport;
		}else{
			$this.href = exportToExcelUrl+'dcr_path='+dcrPath+'&base_code='+encodeURIComponent(tempCompBaseCode)+'&modelId='+allModelsToExport;
		}
		
	}else{
		
		if(tempCompBaseCode==null || tempCompBaseCode == ''){
			$this.href = exportToExcelUrl+'dcr_path='+dcrPath+'&modelId='+modelsToExport;
		}else{
			$this.href = exportToExcelUrl+'dcr_path='+dcrPath+'&base_code='+encodeURIComponent(tempCompBaseCode)+'&modelId='+modelsToExport;	
		}
		
	}

	
}


// Method fetches the locale name fromt the dcr_path
function getStringPart(seperator,location){
	if(typeof dcrPath == "undefined" || dcrPath == null){
	dcrPath = "";
	}
	var seperatedArray = dcrPath.split('/',location+1); 
	var stringPart = seperatedArray[location];
	return stringPart;
	
}

// Called on click of Compatible Equipment tab
function compatibleEquipment_Click($this){

	if(typeof runtime_env=="undefined"){
		runtime_env = "live";
	}
	var orderId =$($this).attr('id');
		var reqMapFeat = {'dcr_path':dcrPath,'order_id':orderId,'id':'div#tab_'+orderId};
		loadingGifMap.set('type','div#tab_'+orderId);
		cachingMap.set('orderId',orderId);
		errorMap.set('type','compatibleEquipmentSet');
		getContent(reqMapFeat,"/wps/PA_crp_"+runtime_env+"/getAccordionData",'compatibleEquipmentSet');
}

// Called on click of product thumbnail for Compatible Equipment.
function compatibleProductThumbnail_Click($this){
	
	if(typeof runtime_env=="undefined"){
		runtime_env = "live";
	}
		var orderId;
		var nodeElement = $($this).get(0).nodeName;
		if(nodeElement == 'A')
		{
			orderId =$($this).attr('id');
			orderId = orderId.slice(2,orderId.length);
		}else 
		{
			orderId =$($this).attr('id');
		}	
		var reqMapFeat = {'dcr_path':dcrPath,'order_id':orderId,'id':'lightbox'};
		loadingGifMap.set('type','lightbox');
		cachingMap.set('orderId',orderId);
		errorMap.set('type','lightbox');
		getContent(reqMapFeat,"/wps/PA_crp_"+runtime_env+"/getLightboxData",'lightbox');
}

//Called on click on next and previous link in light box
function lightBoxNextPrev_Click($this){

	if(typeof runtime_env=="undefined"){
		runtime_env = "live";
	}
	var orderId =$($this).attr('id');
		
		if($('div.MOD_FO_8').length>0)
		{
			var reqMapFeat = {'dcr_path':dcrPath,'order_id':orderId,'id':'lightbox'};
			loadingGifMap.set('type','lightbox');
			cachingMap.set('orderId',orderId);
		getContent(reqMapFeat,"/wps/PA_crp_"+runtime_env+"/getLightboxData",'lightbox');
		}else
		{
		var reqMapFeat = {'dcr_path':dcrPath,'order_id':orderId,'id':'learnMore'};
		loadingGifMap.set('type','learnmore');
		findTotalCurrentLinks(orderId);
		isNextPrevLink = true;
		nextPrevObject = this;
		cachingMap.set('orderId',orderId);
		getContent(reqMapFeat,"/wps/PA_crp_"+runtime_env+"/getLearnMoreData",'learnMore');
		}	
}

//Called on click of close button of lightbox
function lightBoxModalClose_Click($this){
	isFirstLearnMore = false;
	isNextPrevLink = false;
	$('.modal .paginator').html('');
	showHidePop('specLayer');
}

// Called on click of learnmore link
function learnMore_Click($this){

	if(typeof runtime_env=="undefined"){
		runtime_env = "live";
	}
	var orderId =$($this).attr('id');

		// Prepare the request map
		var reqMapFeat = {'dcr_path':dcrPath,'order_id':orderId,'id':'learnMore'};
		
		findTotalCurrentLinks(orderId);

		//caching data
		cachingMap.set('orderId',orderId);
		loadingGifMap.set('type','learnmore');
		getContent(reqMapFeat,"/wps/PA_crp_"+runtime_env+"/getLearnMoreData",'learnMore');
}


// Called on click of learnmore link
function configurator_More_Click($this){
	if(typeof runtime_env=="undefined"){
		runtime_env = "live";
	}
	var attachID =$($this).attr('id');
		// Prepare the request map
		var reqMapFeat = {'dcr_path':dcrPath,'attach_id':attachID,'id':'configuratorLearnMore'};
		//caching data
		cachingMap.set('attachID',attachID);
		loadingGifMap.set('type','configuratorLearnMore');
		getContent(reqMapFeat,"/wps/PA_crp_"+runtime_env+"/struts/getConfiguratorMoreData",'configuratorLearnMore');
}

/**
 * This function is called on click of compare button to find the comparison result of specifcations for the the competitor models 
 * @param $this
 */
function compare_Click($this,baseCode){
	$('div.compare .listCompare li input[type=checkbox]:checked, div.compare .listCompare2 li input[type=checkbox]:checked').each(function(index) {
		compareModalsArr += $(this).attr('id')+',';
	});
	
	var requestMap = {'dcr_path':dcrPath,'base_code':baseCode,'id':'compareSpec'};
	loadingGifMap.set('type','div.compare');
	if(checkAjaxRequestMap.get('compareSpec')!='second'){
		checkAjaxRequestMap.set("compareSpec", "first");
	}
	baseCodeCompareSpecs = baseCode;
	whichTab = 'compareSpec';
	getContent(requestMap,"/wps/PA_crp_"+runtime_env+"/getCompareSpecsData",'compareSpec',baseCodeCompareSpecs);

}
/**
 * This method will bring the model specification based on the base code selected from the dropdown
 * @param pci_code : pci code of the Model
 * @param sbu_code : Sbu to which it belongs (CED/AT)
 * @param locale : 
 * @param baseCode : Base code selcted from the dropdown
 */
function baseCode_click(dcr, baseCode,whichTabClicked, fromChangeEvent){
	/*KC 14501572 added additional parameter fromChangeEvent to indentify event source*/
	if(typeof runtime_env=="undefined"){
			runtime_env = "live";
	}
	if(whichTabClicked=='specifications'){
		var _baseCode = baseCode;/*RS for print preview */
		basecode = baseCodeMap.get(baseCode);
		tempSpecsBaseCode = basecode;
		var reqMapSer = {'dcr_path':dcr,'base_code':basecode,'id':'specifications'};
		fromBaseCode = true;
		loadingGifMap.set('type','div.specifications');
		errorMap.set('type','specifications');
		getContent(reqMapSer,"/wps/PA_crp_"+runtime_env+"/getSpecsData",'specifications',basecode);
		if($('.print_preview .print_right_column').length>0){/*RS for print preview */
			$('#select_model').val(_baseCode);
			/* KC Artifact ID 14501572 to select most recent model we assume that most recent one comes last*/			
			//$(".print_preview #select_model option:last").attr("selected", "selected");

			if(fromChangeEvent === true) {
				$(".print_preview #select_model option[value='"+_baseCode+"']:first").attr("selected", "selected");	
			} else {
				$(".print_preview #select_model option:last").attr("selected", "selected");	
			}
			
		}
	}else if(whichTabClicked='compare'){
		var tempbasecodecomp= compareBaseCodeMap.get(baseCode);
		tempCompBaseCode = tempbasecodecomp;
		var reqMapSer = {'dcr_path':dcr,'base_code':tempbasecodecomp,'id':'compare'};
		fromCompareBaseCode = true;
		loadingGifMap.set('type','div.compare');
		errorMap.set('type','compare');
		getContent(reqMapSer,"/wps/PA_crp_"+runtime_env+"/getCompareProductData",'compare',tempbasecodecomp);
	}
		
	

}

/**
 *	This function enable the checkbox
 */ 
function enableCompare($this,baseCode){
	var a = 0;
	$('.listCompare li input').each(function(index) {
		if ($(this).attr('checked')) {
			if(index!=0){
			a++;
			}
		}
	});
	$('.listCompare2 li input').each(function() {
		if ($(this).attr('checked')) {a++;}
	});
	if (a>=1) {
		$('.MOD_FO_10 .header a').removeClass('noCompareModels').addClass('compareModels');

		$('div.compare a.compareModels').unbind('click');
		$('div.compare a.compareModels').bind('click',function(){compare_Click(this,baseCode);});
	}else{
		$('div.compare a.compareModels').unbind('click');
		$('.MOD_FO_10 .header a').removeClass('compareModels').addClass('noCompareModels');
	}


	a = 0;
}

/**
 *	This function checks all the checkboxes on the left side of products in compare tab.
 */
function checkAllAutoLeft($this){
	$(".checkLeft").attr('checked', $('#checkAllAutoLeft').is(':checked'));   
}

/**
 *	This function checks all the checkboxes on the right side of products in compare tab
 */
function checkAllAutoRight($this){
	$(".checkRight").attr('checked', $('#checkAllAutoRight').is(':checked'));   
}



/* Find the Total no. of learn more links present on learnmore link and current position of learn more link.
 * @param orderId : contains the orderId of learn more link, to find its position and associating to current position.
 */
function findTotalCurrentLinks(orderId){
	if(displayType=="flat")
	{
		if(totalLearnMoreLink==undefined)
		{
			totalLearnMoreLink = $('div.features').find('div.MOD_GC_22b').length;
		}
		$('div.features').find('div.MOD_GC_22b').each(function(index)
		{
			var id = $(this).find('a.more').attr('id');
			if (id==orderId)
			{
				currentLearnMore = index+1;
			}
		});
	}else if(displayType=="group")
	{
		$('div.features').find('div.MOD_GC_22afc .detail').each(function()
		{
			$(this).find('a.more').each(function(index)
			{
				var id = $(this).attr('id');

				if (id==orderId)
				{
					currentLearnMore = index + 1;
					totalLearnMoreLink = $(this).parent().parent().children().length;
					return false;
				}
			});
		});
	}else if(displayType=="tab")
	{
		$('div.features').find('div.MOD_GC_22afc').each(function()
		{
			$(this).find('div').each(function()
			{
				$(this).find('a.more').each(function(index)
				{
					var id = $(this).attr('id');
					if (id==orderId)
					{
						currentLearnMore = index + 1;
						totalLearnMoreLink = $(this).parent().parent().find('a.more').length;
						return false;
					}
				});
			});
		});
	}
}

/* Checks request for caching and if not present calls for ajax request.
 * 	@param requestParam contains the request parameters
 * 	@param actionName contains ajax Request relative url.
 * 	@param type of data that is to fetched ie. features or specifications or learnmore
 */
function getContent(requestParam,actionName, type,baseCodeRequested){
	var key = type;

	// Caching Implementation
	if(type=='learnMore')
	{	key=requestParam['order_id'];
		if(cachingMap.get(key)!=null)
		{
			callbackLoadingGif();

		}
	}else if(type=='configuratorLearnMore')
	{	key=requestParam['attach_id'];
		if(cachingMap.get(key)!=null)
		{
		callbackLoadingGif();
		}
	}
	
	else if(type=='lightbox')
	{	
		key=requestParam['order_id'];
		if(cachingMap.get(key)!=null)
		{
			callbackLoadingGif();
		}
	}else if(type=='compatibleEquipmentSet')
	{	
		key=requestParam['order_id'];
	}

	switch (type) {
	case "specifications":

		if(cachingMap.get('baseCode'+type)==null){

			if(cachingMap.get('specifications')==null){

				if(checkAjaxRequestMap.get(key)=='first'){

					currDot=0;
					// Prepare for ajax Call
					loadAjax(requestParam,actionName,type);
				}

				}else{
					currDot=0;
					showModels.clear();
					if(model_namesCache.get(type)!=null){
						for(var valArr =1; valArr <= model_namesCache.get(type).keyArray.length;valArr++){
							showModels.keyArray.push(valArr);
							showModels.valArray.push(("td_1_"+valArr+" td_col_"+valArr));
						}
					}
					setHtml(cachingMap.get(key), type,key);
					basecode=null;
				}

		}else{
			if(fromBaseCode==false){
				callbackLoadingGif();
				product_model(cachingMap.get('baseCode'+type),type);
			}else{
				if(cachingMap.get(baseCodeRequested)==null||baseCodeRequested==null ){
					if(checkAjaxRequestMap.get(key)=='first' || $('#nyroModalWrapper .print_preview .print_right_column').length>0){/* RS for print preview */
						// Prepare for ajax Call
						currDot=0;
						loadAjax(requestParam,actionName,type);
					}
				}else{
						currDot=0;
						showModels.clear();
						currentRTable.currentTabBaseCode = baseCodeRequested+type;
						if(model_namesCache.get(currentRTable.currentTabBaseCode)!=null){
							for(var valArr =1; valArr <= model_namesCache.get(currentRTable.currentTabBaseCode).keyArray.length;valArr++){
								showModels.keyArray.push(valArr);
								showModels.valArray.push(("td_1_"+valArr+" td_col_"+valArr));
							}
						}
						setHtml(cachingMap.get(baseCodeRequested), type,key);
				}
			}

		}
		break;
	case "compareSpec" :
		if(cachingMap.get(baseCodeRequested+'compareSpec')==null){
				
				currDot=0;
				// Prepare for ajax Call
				loadAjax(requestParam,actionName,type);

		}else{
			currDot=0;
			callbackLoadingGif();
			showModels.clear();
			currentRTable.currentTabBaseCode = baseCodeRequested+type;
			if(model_namesCache.get(currentRTable.currentTabBaseCode)!=null){
				for(var valArr =1; valArr <= model_namesCache.get(currentRTable.currentTabBaseCode).keyArray.length;valArr++){
					showModels.keyArray.push(valArr);
					showModels.valArray.push(("td_1_"+valArr+" td_col_"+valArr));
				}
			}
			setHtml(cachingMap.get(baseCodeRequested+'compareSpec'), type,key);
		}
		break;
	case "compare" :
		
		if(cachingMap.get('baseCodecompare')==null){

			if(cachingMap.get(baseCodeCompareSpecs+'compare')==null||baseCodeCompareSpecs==null){

				if(checkAjaxRequestMap.get(key)=='first'){
					// Prepare for ajax Call
					loadAjax(requestParam,actionName,type);
				}

			}else{
				setHtml(cachingMap.get(baseCodeCompareSpecs+'compare'), type,baseCodeCompareSpecs);
			}

		}else{
			if(fromCompareBaseCode==false){
				callbackLoadingGif();
				product_model(cachingMap.get('baseCode'+type),type);
				
			}else{
				if(cachingMap.get(baseCodeRequested+'compare')==null){

					if(checkAjaxRequestMap.get(key)=='first'){
						// Prepare for ajax Call
						loadAjax(requestParam,actionName,type);
					}
				}else{
						setHtml(cachingMap.get(baseCodeRequested+'compare'), type,baseCodeRequested);
					}
				}
			}

		break;
    case 'compatibility_matrix':
			if(cachingMap.get('compatibility_matrix')==null){
				loadAjax(requestParam,actionName,type);
			}else{
				$('#content_column .MOD_GC_29 .MOD_GC_29_pagination').css('display','none');
				$('#content_column .MOD_GC_29 .MOD_GC_29_gridview').css('display','none');
				if($('#content_column .MOD_GC_29 .errormessage').length!=0){
					$('#content_column .MOD_GC_29 .errormessage').remove();
				}
				createTreeStructureMatrix();
				createTreeStructure();
			}

		break;
	/*DD artf1270662 Compatible Equipment Tab Accordin */
	case 'compatible':
		if(cachingMap.get(key)==null){
			// Prepare for ajax Call
			loadAjax(requestParam,actionName,type);
		}else{
			setHtml(cachingMap.get(key), type,key);
			$(".MOD_FO_6d h3:first").trigger('click');
		}
	break;
		
	default:
		if(cachingMap.get(key)==null)
		{
			// Prepare for ajax Call
			loadAjax(requestParam,actionName,type);

		}
		else
		{
			setHtml(cachingMap.get(key), type,key);
		}
	break;
	}

}

/* Load the ajax request
 * @param modelMap contains the request parameters
 * @param actionName contains ajax Request relative url.
 * @param type of data that is to fetched ie. features or specifications or learnmore
 */
function loadAjax(modelMap,actionName,type){

	// Call the ajax requeset
	$.ajax({
		type:'Post',
		url:actionName,
		beforeSend:callbackLoadingGif,
		data:modelMap,
		dataType:'xml',
		success: handleResponseXml,
        error: handleErrorResponse
	}); 		
}
/* Load the ajax request
 * @param modelMap contains the request parameters
 * @param actionName contains ajax Request relative url.
 * @param type of data that is to fetched ie. features or specifications or learnmore
 */
function loadAjaxReq(modelMap,actionName,type){

	// Call the ajax requeset
	$.ajax({
		type:'Post',
		url:actionName,
		data:modelMap,
		dataType:'xml',
		success: handleVelResponseXml,
        error: handleErrorResponse
	}); 		
}
function loadAjaxSearchReq(modelMap,actionName,type){
	$.ajax({
		type:'Post',
		url:actionName,
		data:modelMap,
		dataType:'xml',
		success: handleSearchResponseXml,
        error: handleErrorResponse
	}); 	
}
function loadAjaxContractsSearchReq(modelMap,actionName,type){
	$.ajax({
		type:'Post',
		url:actionName,
		data:modelMap,
		dataType:'xml',
		success: handleContractsSearchResponseXml,
        error: handleErrorResponse
	}); 	
}
function loadAjaxContractsListReq(modelMap,actionName,type){

	$.ajax({
		type:'Post',
		url:actionName,
		data:modelMap,
		dataType:'xml',
		success: handleContractsListResponseXml,
        error: handleErrorResponse
	}); 	
}

/**
 *   
 */
function handleErrorResponse(jqXHR, responseText,errorThrown){
  var requestUrl = this.url;

  if(requestUrl.indexOf('getFeaturesData')!=-1){
	$('div.features').html(generalErrorMessage);

  }else if(requestUrl.indexOf('getSpecsData')!=-1){
		$('div.specifications').html('<div class="errormessage">'+generalErrorMessage+'</div>');
  }
  else if(requestUrl.indexOf('getCompatibleTabData')!=-1){
	$('div.compatible').html('<div class="errormessage">'+generalErrorMessage+'</div>');

  }
  else if(requestUrl.indexOf('getLearnMoreData')!=-1){

  }
  else if(requestUrl.indexOf('getAccordionData')!=-1){
	$('div.compatible').html('<div class="errormessage">'+generalErrorMessage+'</div>');
  }
  else if(requestUrl.indexOf('getLightboxData')!=-1){
	
  }
  else if(requestUrl.indexOf('getCompareProductData')!=-1){
	  $('div.compare').html('<div class="errormessage">'+generalErrorMessage+'</div>');

  }
  else if(requestUrl.indexOf('getCompareSpecsData')!=-1){

  }
  else if(requestUrl.indexOf('getCompatibleMatrixViewXml')!=-1){
	errorInResponseCheck = true;
	if(gridLayoutMatrixImageClicked==true){
		var length = $('.MOD_FO_19 .loading').length;
			if(length==1){
				$('.MOD_FO_19 .loading').remove();
			}

			var overDivLength = $('#content_column #overlayDiv,#content_column #overlayDivFull').length;
			if(overDivLength ==1 || overDivLength ==2){
				$('#overlayDiv, #overlayDivFull').remove();
			}
			var	errorMessage = '<div class="errormessage">'+generalErrorMessage+'</div>';
			if($('.MOD_GC_29 .errormessage').length==0){
					$('.MOD_GC_29').append(errorMessage);
			}
	}

  }
  else if(requestUrl.indexOf('getProductEquipment')!=-1){
	
	var length = $('.MOD_FO_19 .loading').length;
	if(length==1){
		$('.MOD_FO_19 .loading').remove();
	}

	var overDivLength = $('#content_column #overlayDiv').length;
	if(overDivLength ==1){
		$('#overlayDiv').remove();
	}
	var	errorMessage = '<div class="errormessage">'+generalErrorMessage+'</div>';
	if($('.MOD_GC_29 .errormessage').length==0){
			$('.MOD_GC_29').append(errorMessage);
	}
		
	$('.content_column .MOD_GC_29_pagination').css('display','none');
	$('.MOD_GC_29 #Searchresult').css('display','none');
	$('.MOD_GC_29 .bottom').css('display','none');
	errorInResponseCheck = true;

  }
  else if(requestUrl.indexOf('getAttachmentLightBox')!=-1){

  }
  else if(requestUrl.indexOf('getCompatibleAttachment')!=-1){
    errorInResponseCheck = true;
	var length = $('.MOD_FO_19 .loading').length;
	if(length==1){
		$('.MOD_FO_19 .loading').remove();
	}

	var overDivLength = $('#content_column #overlayDiv').length;
	if(overDivLength ==1){
		$('#overlayDiv').remove();
	}
	var	errorMessage = '<div class="errormessage">'+generalErrorMessage+'</div>';
	if($('.MOD_GC_29 .errormessage').length==0){
			$('.MOD_GC_29').append(errorMessage);
	}
		
	$('.content_column .MOD_GC_29_pagination').css('display','none');
	$('.MOD_GC_29 #Searchresult').css('display','none');
	$('.MOD_GC_29 .bottom').css('display','none');

  }
}

//  Displays the loading gif,till the response from the server is rendered.
function callbackLoadingGif(){
	if(loadingGifMap.get('type')=='lightbox'||loadingGifMap.get('type')=='learnmore' ||loadingGifMap.get('type')=='compatibility_lightbox' ||loadingGifMap.get('type')=='configuratorLearnMore')
	{
		if(isFirstLearnMore==false){

			if(isFirstTimeIframe==false)
			{	
				if($('iframe #frm').length==0)
				{
					learnMoreHeader = '<iframe id="frm" frameborder="0"></iframe><div id="bkgPop"></div>';
					if(loadingGifMap.get('type')=='lightbox'|| loadingGifMap.get('type')=='compatibility_lightbox')
					{
						learnMoreHeader = learnMoreHeader + '<div class="MOD_FO_8"><div id="specLayer" class="modal" style="height:220px;padding-top:220px"> ';
						$('body').append(learnMoreHeader);
						isFirstTimeIframe = true;
						$("div#specLayer").html('<img src="/common/deere-resources/img/loading.gif" alt="loading..." style="display:block;width:24px;height:24px;margin:0 auto" /><p class="title"></p><div class="itemContent"></div></div></div>');
					}else
					{
						learnMoreHeader = learnMoreHeader + '<div id="specLayer" class="modal" style="height:360px;padding-top:360px"> ';
						$('body').append(learnMoreHeader);	
						isFirstTimeIframe = true;
						$("div#specLayer").html('<img src="/common/deere-resources/img/loading.gif" alt="loading..." style="display:block;width:24px;height:24px;margin:0 auto" /><ul class="MOD_FO_3 paginator"></ul><p class="title"></p><div class="itemContent"></div></div>');
					}
				}
			}else
			{
				learnMoreHeader ='';
				if(loadingGifMap.get('type')=='lightbox' || loadingGifMap.get('type')=='compatibility_lightbox')
				{
					if($('div.MOD_FO_8').length==0){
						$('<div class="MOD_FO_8"><div id="specLayer" class="modal" style="height:220px;padding-top:220px"></div></div>').replaceAll('div#specLayer');	
					}	
					$('div#specLayer').css("height","220px");
					$('div#specLayer').css("padding-top","220px");
					$("div#specLayer").html('<img src="/common/deere-resources/img/loading.gif" alt="loading..." style="display:block;width:24px;height:24px;margin:0 auto" /><p class="title"></p><div class="itemContent"></div>');

				}else
				{
					if($('div.MOD_FO_8').length>0)
					{
						$('div.MOD_FO_8').remove();
						learnMoreHeader = learnMoreHeader + '<div id="specLayer" class="modal" style="height:320px;padding-top:320px"> ';
						$('body').append(learnMoreHeader);	
						$('div#specLayer').css("height","360px");
						$('div#specLayer').css("padding-top","360px");
					
					}	
						$("div#specLayer").html('<img src="/common/deere-resources/img/loading.gif" alt="loading..." style="display:block;width:24px;height:24px;margin:0 auto" /><ul class="MOD_FO_3 paginator"></ul><p class="title"></p><div class="itemContent"></div></div></div>');
				}
				
			}
			showHidePop('specLayer');
			if(loadingGifMap.get('type')=='lightbox'|| loadingGifMap.get('type')=='compatibility_lightbox'){

				$('#specLayer').css("top", ( $(window).height() - $('#specLayer').height() ) / 2+$(window).scrollTop() + "px");
				$('#specLayer').css("left", ( $(window).width() - $('#specLayer').width() ) / 2+$(window).scrollLeft() + "px");
			}
		}else
		{
			if($('div.MOD_FO_8').length==0)
			{
				$('div#specLayer').css("height","360px");
				$('div#specLayer').css("padding-top","360px");
				if(loadingGifMap.get('type')=='lightbox' || loadingGifMap.get('type')=='compatibility_lightbox'){
					$("div#specLayer").html('<img src="/common/deere-resources/img/loading.gif" alt="loading..." style="display:block;width:24px;height:24px;margin:0 auto" /><p class="title"></p><div class="itemContent"></div></div>');
				}else{
					$("div#specLayer").html('<img src="/common/deere-resources/img/loading.gif" alt="loading..." style="display:block;width:24px;height:24px;margin:0 auto" /><ul class="MOD_FO_3 paginator"></ul><p class="title"></p><div class="itemContent"></div></div>');
				}
				
			}else
			{
				$('div#specLayer').css("height","220px");
				$('div#specLayer').css("padding-top","220px");
				if(loadingGifMap.get('type')=='lightbox' || loadingGifMap.get('type')=='compatibility_lightbox'){
					$("div#specLayer").html('<img src="/common/deere-resources/img/loading.gif" alt="loading..." style="display:block;width:24px;height:24px;margin:0 auto" /><p class="title"></p><div class="itemContent"></div></div>');
				}else{
					$("div#specLayer").html('<img src="/common/deere-resources/img/loading.gif" alt="loading..." style="display:block;width:24px;height:24px;margin:0 auto" /><ul class="MOD_FO_3 paginator"></ul><p class="title"></p><div class="itemContent"></div></div>');
				}
				
			}
		}	
	}else if(loadingGifMap.get('type')=='compatibility_info'){
		var overDivLength = $('#content_column #overlayDiv').length;
		if(overDivLength ==0){
			$('#content_column').append('<div id="overlayDiv" style="height: 618px;"><img width="24" height="24" alt="Loading" src="/common/deere-resources/img/loading-data.gif" style="top: 299px;"></div>')
		}
		contentCol();
	}else if(loadingGifMap.get('type')=='compatibility_matrix_info'){
		
	}
	else 
	{
		$(loadingGifMap.get('type')).html('<img src="/common/deere-resources/img/loading.gif" alt="loading..." style="display:block;width:24px;height:24px;margin:0 auto" />');
	}
	checkAjaxRequestMap.set(whichTab, "second");
}

/**
 *  This function is called when ajax request fails for the error.
 */


/* Call back function containing the xml response of ajax request from server.
 * Parse the XML to find out whether response is for features(flat/tab/group), specifications(flat,group,pdf) or learnMore
 * and call the appropriate functions.
 *  @param xml Contains the response XML 
 */
function handleResponseXml(xml){

	// Check the type of response (features/specs/learnMore)
	var parentTag = '';
	var methodName = '';
	var whichTabCheck;
    xmlResp = xml;
	    	
	parentTag = $($(xmlResp).get(0)).find('*')[0];
	methodName = $($(xmlResp).get(0)).find('*')[0].tagName.toLowerCase();
	whichTabCheck = $(parentTag).attr('id');
	
	if(whichTabCheck=="specifications"|| whichTabCheck=="compareSpec")
	{
	    	var category=getStringPart('/',3);

			if(category=="model")
			{
	    		displayType =  $(parentTag).attr('display');
	    	}
			else {
	    		displayType="";
	    	}
		}
	 	else{
	 		
				if(loadingGifMap.get('type')=="div.compatible" || loadingGifMap.get('type')=="lightbox"||loadingGifMap.get('type')=="compatibility_lightbox"||loadingGifMap.get('type').charAt(3)=="#")
	    	{
	    		displayType =  $(parentTag).attr('type');
	    	}else 
	    	{	displayType =  $(parentTag).attr('display');
				featuresSource = $(parentTag).attr('source');
			  	}
	  }


	 xmlResponse = xmlResp;
	if(whichTabCheck=="learnMore" || whichTabCheck=="compare" ||whichTabCheck=="configuratorLearnMore")
	{
		 method = methodName;
	}
	else if(whichTabCheck=="specifications"|| whichTabCheck=="compareSpec")
	{
		if(displayType!=""&&displayType!=undefined)
		{	
			method = methodName + '_' + displayType;
		}
		else
		{
			method = methodName;
		}
	}
	  else if(methodName=="error")
	  {
	    	method = methodName;
	   }
	   else
	   {
		method = displayType==undefined ?methodName:methodName + '_' + displayType;
	   }

	// Call the respective method dynamically
	if(method!=undefined)
	{	
		if(method=='features_tab'){
			funcall = method + '(xmlResp,whichTabCheck,featuresSource);';
		}else{
			funcall = method + '(xmlResp,whichTabCheck);';
		}
		
		eval(funcall);
	}
}

/* Call back function containing the xml response of ajax request from server.
 * Parse the XML to find out whether response is for features(flat/tab/group), specifications(flat,group,pdf) or learnMore
 * and call the appropriate functions.
 *  @param xml Contains the response XML 
 */
function handleVelResponseXml(xml){

	// Check the type of response (features/specs/learnMore)
	var parentTag = '';
	var methodName = '';
	
    xmlResp = xml;
	    	
	parentTag = $($(xmlResp).get(0)).find('*')[0];
	methodName = $($(xmlResp).get(0)).find('*')[0].tagName.toLowerCase();
	
	xmlResponse = xmlResp;
	
	if(methodName!=undefined)
		{	
			funcall = 'vel'+'_'+methodName + '(xmlResp);';
			eval(funcall);
		}
	}
	
		function vel_error(xmlResp) {
		$('form#velocity').before('<div class="errormessage">' + serverError + '</div>');
	}
function handleContractsSearchResponseXml(xml) {

    var counter = 1;
    var error = "";
    var divClass = "column_gc";
    var content = "";
    var errorMessage = generalErrorMessage;
    var siteName = $(xml).find("siteName").text();
    var applicationName = $(xml).find("applicationName").text();
    content = '<input id="site_name" type="hidden" name="site_name" value="' + siteName + '"/><input type="hidden" name="application_name" value="' + applicationName + '"/>';
    $("#output").append($(content));
    if ($(xml).find("error_message").text() != '' || $(xml).find("error").text() != '') {
        error = '<p class="errMsg">' + errorMessage + '</p>';
        $("#output").append(error);
    }
	
    $(xml).find("filterCriteria").each(function () {
        if (counter == 2) {
            divClass = "column_gc last";
            counter = 0;
        } else {
            divClass = "column_gc";
        }
		
        var filterName = $(this).find("filterName").text();
        var filterType = $(this).find("filterType").text();
        var paramName = $(this).find("paramName").text();
    

        if (filterType == 'Dropdown') {
            var optionList = '';
            $(this).find("option").each(function () {
                var optionName = $(this).text();
                var optionValue = $(this).text();
                if ($(this).text() != "All States" && $(this).text() != "Please Select") {
                    optionList = optionList + '<option value="' + optionValue + '">' + optionName + '</option>';
                }
            });
            if (counter == 0) {
                content = '<div class="' + divClass + '"><label class="paramName" for="' + paramName + counter + '">' + filterName + ':</label><select id="' + paramName + counter + '" name="' + paramName + '">' + optionList + '</select></div>';
            } else {
                content = '<div class="' + divClass + '"><label class="paramName" for="' + paramName + counter + '">' + filterName + ':</label><select id="' + paramName + counter + '" name="' + paramName + '">' + optionList + '</select></div>';
            }
        }
        $("#output").append($(content));

        counter++;
    });
	
    if (counter > 0 && error == "") {
        $("#submitbutton").append('<div class="clearBoth"></div><span class="submit_btn"><input class="submit_btnInput" type="button" value="Submit" /></span>');
    } else {
        $("#submitbutton").append('<div class="clearBoth"></div><span class="btn_inactive"><input class="btn_inactive_input" type="button" disabled="" value="Submit" /></span>');
    }
}

function handleContractsListResponseXml(xml) {

    var counter = 0;
    var error = "";
    var urlLinks = "";
    var headerContent = "";
    var content = "";
    var errorContent = "";
    var urlheaders = "";
    var officialwebSite = "";
	var isurlEmpty = false;
    var categoryName = $(xml).find("categoryName").text();
    var enablePagination = '<div class="pagination_results"></div><div class="page_navigation pagination"></div>';
    var govtPcrNotes = $('.govt_pcr_notes').html();
    var industryName = $('.MOD_FO_44 select#industry').val();

    if ($(xml).find("error_message").text() != '') {
        error = noErrorText;
        $(".contract_results").html(error).slideDown();
        return;
    } else {
        var contract_type = $(xml).find("contractType").text();
        var categoryUrl = $(xml).find("categoryURL").text();
        var categoryDesc = $(xml).find("categoryDescription").text();
        var viewContractsBtn = '<p class="more_link viewContractsBtn"><a title="View all state contracts" href="#" class="more">View all' + ' ' + $('label.paramNames').text().replace(':', '') + ' ' + 'contracts</a></p>';
        headerContent = headerContent + '<h2>' + contractResults + ' ' + forText + ' ' + categoryName + ' ' + industryName + '</h2>' + '<h4 id="state">' + categoryName.toUpperCase() + '</h4><p class="secondary_subhead">' + categoryDesc + '</p>'
        if (categoryUrl != "") {
            officialwebSite = '<p>' + moreText + ' <a href="' + categoryUrl + '" title="' + ' ' + categoryName + 'official web site">' + categoryName + ' ' + officialwebSiteText + '</a>.</p>';
        }
        $(xml).find("contract").each(function () {

            var contractName = $(this).find("contract_name").text();
            var contractPath = $(this).find("contract_path").text();
            if (contractName != "" && contractPath != "") {
                if (isurlEmpty == true) {
                    urlLinks = '';
                }
                counter++;
                urlLinks = urlLinks + '<li><a target="_blank" href="' + constructPageLink(contractPath) + '">' + contractName + '</a></li>';

            } else {
                if (urlLinks == "") {
                    urlLinks = noContracts;
                    isurlEmpty = true;
                }
            }
        });
        if (urlLinks == "") {
            urlLinks = noContracts;
            urlheaders = '<h4>' + counter + ' ' + $('label.paramNames').text().replace(':', '') + ' ' + 'contracts' + '</h4><div id="govt_pcr">	<ul class="contract_list content">';
        } else {
            urlheaders = '<h4>' + counter + ' ' + $('label.paramNames').text().replace(':', '') + ' ' + 'contracts' + '</h4><div id="govt_pcr">	<ul class="contract_list content">';
        }
        content = content + headerContent + urlheaders + urlLinks + '</ul>' + enablePagination + '</div>' + officialwebSite;

        $(".MOD_FO_44 .contract_results").html(content).slideDown();
        $(".MOD_FO_44 .contract_results").append(govtPcrNotes).show();
		
        /* MG  Govt PCR	*/
        $('#govt_pcr ul.contract_list li:gt(9)').hide();
		
        var totalResult = $('#govt_pcr ul.contract_list li').length;
        var currentTotalFirst = $('#govt_pcr ul.contract_list li:visible:first').index() + 1;
        var currentTotal = $('#govt_pcr ul.contract_list li:visible:last').index() + 1;
		
        $('.MOD_FO_44 #govt_pcr .page_navigation a').live('click', function () {
            totalResult = $('#govt_pcr ul.contract_list li').length;
            currentTotalFirst = $('#govt_pcr ul.contract_list li:visible:first').index() + 1;
            currentTotal = $('#govt_pcr ul.contract_list li:visible:last').index() + 1;
            $('#govt_pcr .pagination_results').html(currentTotalFirst + ' - ' + currentTotal + paginationOutOfText + totalResult + paginationResultsText);
        });

        if (totalResult > 10) {
            $('#govt_pcr .pagination_results').show();
            $('.MOD_FO_44 #govt_pcr .pagination').after($(viewContractsBtn)).html();
            $('.MOD_FO_44 #govt_pcr .viewContractsBtn').click(function (e) {
                e.preventDefault();
                $('#govt_pcr').pajinate({
                    items_per_page: 10
                });
                $('.MOD_FO_44 #govt_pcr .pagination').show();
                totalResult = $('#govt_pcr ul.contract_list li').length;
                currentTotalFirst = $('#govt_pcr ul.contract_list li:visible:first').index() + 1;
                currentTotal = $('#govt_pcr ul.contract_list li:visible:last').index() + 1;
                $('#govt_pcr .pagination_results').html(currentTotalFirst + ' - ' + currentTotal + paginationOutOfText + totalResult + paginationResultsText);
                if ($('.MOD_FO_44 #govt_pcr .pagination')[0]) {
                    $('.MOD_FO_44 #govt_pcr .viewContractsBtn').hide();
                }
            });
        }
    }
}

	function handleSearchResponseXml(xml){
		var counter = 1;
		var error = "";
		var divClass = "column_gc";
		var content="";
		var site_name = $(xml).find("siteName").text(); 
		var application_name = $(xml).find("applicationName").text(); 
		content = '<input type="hidden" name="site_name" value="'+site_name+'"/><input type="hidden" name="application_name" value="'+application_name+'"/>';
$("#output").append($(content));
		$(xml).find("filterCriteria").each(function()
		{
		if (counter == 3){
			divClass = "column_gc last_column_gc";
			counter=0;
		}
		else{
			divClass = "column_gc";
		}
		

		  var filter_name = $(this).find("filterName").text();
		  var filter_type = $(this).find("filterType").text();
		  var param_name = $(this).find("paramName").text();
		  var default_value = $(this).find("filterDefaultValue").text();
		  
		if (filter_type == 'Dropdown')
		{
		  var optionList='';
		  $(this).find("option").each(function()
		  {
			  var optionName = $(this).text();
			  var optionValue = $(this).text();
			if ($(this).text() == 'All Categories'){
				optionName = allCategories;
				optionValue = '';
			}
			else if ($(this).text() == 'All Current Products'){
				optionName = allCurrentProducts;
			}
			 else if ($(this).text() == 'All Discontinued Products'){
				optionName = allDiscontinuedProducts;
			} 

			if ($(this).text() == default_value)
			  {
				optionList = optionList + '<option value="'+optionValue+'" selected="true">'+optionName+'</option>';
			  }
			  else {
				  optionList = optionList + '<option value="'+optionValue+'">'+optionName+'</option>';
			  }
		  });
		  $(this).find("error").each(function(){
		  
				optionList = optionList + '<option value="'+default_value+'" selected="true">'+default_value+'</option>';
					error = error.replace(' and ',', ');
					error = error +' and '+ filter_name;
		  });
			content = '<div class="'+divClass+'"><label for="'+param_name+counter+'">'+filter_name+':</label><select id="'+param_name+counter+'" name="'+param_name+'">'+optionList+'</select></div>';

		}
		else if (filter_type == 'TextBox'){
		
			content = '<div class="'+divClass+'"><label for="'+param_name+counter+'">'+filter_name+':</label><input type="text" name="'+param_name+'" id="'+param_name+counter+'" value="'+default_value+'" class="input_text" /></div>';
		}
		  $("#output").append($(content));

		counter++;

		});
		error = error.replace(/^( and )|^(, )/, '');

		if (error != '')
		{
		var errMsg = navcomError1+error+navcomError2;

		  $("#navcomError").html(errMsg);
		}
}
	/*
	 * This method parses the error xml response
	 */

	function error(xmlResp,whichTabClick){
		var errorMessage = $(xmlResp).find('error_message').text();
		var erroMessageHtml = '';
		if(whichTabClick =='configuratorLearnMore'){
		$('.modal p.title').remove();
		 erroMessageHtml = '<p class="error padding-left padding-top padding-bottom">' + errorMessage + '</p>';
		}else{
		 erroMessageHtml = '<p class="error">' + errorMessage + '</p>';
		}
		if(whichTabClick=='product_equipment'){
			var length = $('.MOD_FO_19 .loading').length;
			if(length==1){
				$('.MOD_FO_19 .loading').remove();
			}

			var overDivLength = $('#content_column #overlayDiv').length;
			if(overDivLength ==1){
				$('#overlayDiv').remove();
			}
			var	errorMessageTemp = '<div class="errormessage">'+errorMessage+'</div>';
			if($('.MOD_GC_29 .errormessage').length==0){
					$('.MOD_GC_29').append(errorMessageTemp);
			}
				
			$('.content_column .MOD_GC_29_pagination').css('display','none');
			$('.MOD_GC_29 #Searchresult').css('display','none');
			$('.MOD_GC_29 .bottom').css('display','none');

		}else if(whichTabClick=='compatibility_info'){
			var length = $('.MOD_FO_19 .loading').length;
				if(length==1){
					$('.MOD_FO_19 .loading').remove();
				}

				var overDivLength = $('#content_column #overlayDiv').length;
				if(overDivLength ==1){
					$('#overlayDiv').remove();
				}
				var	errorMessageTemp = '<div class="errormessage">'+errorMessage+'</div>';
				if($('.MOD_GC_29 .errormessage').length==0){
						$('.MOD_GC_29').append(errorMessageTemp);
				}
					
				$('.content_column .MOD_GC_29_pagination').css('display','none');
				$('.MOD_GC_29 #Searchresult').css('display','none');
				$('.MOD_GC_29 .bottom').css('display','none');

		}else{
			setHtml(erroMessageHtml,whichTabClick);
			checkAjaxRequestMap.set(whichTabClick, "first");
		}
		
	}

	/*
	 * This method will diplay the basecodes returned of the model
	 * Call the baseCode_click method on selection of a base code.
	 * Sotre the response in cachingMap
	 */
	function product_model(xmlResp,whichTabCheck){

	
	var model = $($(xmlResp).get(0))   .find('*')[0];
	var title = $(model).attr('title');
	
	if(title==undefined){
		title='';
	}

	var pci_code = $(xmlResp).find('pci_code').text();
	var sbu_code = $(xmlResp).find('sbu').text();
	var locale = $(xmlResp).find('locale').text();
	var dcr = $(xmlResp).find('dcr_path').text();
	if(dcr=="" || dcr == undefined){
		dcr = dcrPath;
	}
	var baseCode = '';
	$(xmlResp).find('base_models').children().each(function(){
		$(this).each(function(){
			var code =  $(this).find('base_code').text();
			var desc =  $.trim($(this).find('desc').text());
			if(whichTabCheck=='compare'){
				isMultipleBaseCodeExistCompare = true;
					compareBaseCodeMap.set(desc,code);
			}else{
				baseCodeMap.set(desc,code);
			}

			baseCode = baseCode + '<option value="'+desc+'">'+desc +'</option>';
		});

	});
	var content = '<div class="baseCode"><h1>'+title+'</h1><h4>'+seeInformationFor+':</h4><p><select id="baseCode">'+baseCode+ '</select></p><p><a href="javascript:void(0)" class="btn_search_jobs nyroModal2Close"><span>'+Go+'</span></a></p></div>';

	cachingMap.set('baseCode'+whichTabCheck,xmlResp);
	checkAjaxRequestMap.set(whichTabCheck, "first");
	
	if(!$('.'+whichTabCheck).hasClass('on')) return false;
	if($('#nyroModalWrapper .print_preview .print_right_column').length>0){/* RS for print preview */
		$('.print_preview .select_model').show();
		if($('.print_preview .select_model #select_model').length <= 0) {
			$('.print_preview .select_model').append('<select id="select_model">'+baseCode+'</select>');
		}
		$('#select_model').focus();
		baseCode_click(dcr,$('#select_model').val(),whichTab);
	}else{
		$.fn.nyroModal2Manual({
			bgColor: '#333333',
			content: content,
			endShowContent:function(){/* RS WCAG */
				_focusedElementBeforeModal = document.activeElement;
				$('#nyroModal2Wrapper #closeBut2').focus();
			},
			endRemove: function(){
				$(_focusedElementBeforeModal).focus();
			}
		});
		$('.print_preview .select_model #select_model').html(baseCode);/* RS for print preview */
		$('a.btn_search_jobs').bind('click',function(){baseCode_click(dcr,$('#baseCode').val(),whichTab);});
	
	}

}


/* Handle the features flat content.
 * Call parseFeatureArticle to generate the html content by parsing the xml response.
 * Store the response in cachingMap.
 * Call the setHtml method to insert the generated html into the div tag.
 */
function features_flat(xmlResp,whichTabCheck){
	var featureFlat = parseFeatureArticle($(xmlResp).find('feature_articles').children(),'MOD_GC_22b',"flat");

	cachingMap.set('features',featureFlat);
	setHtml(featureFlat,'features');
}

/* Handle the features tab content.
 * Call parseFeatureArticle & parseFunctionalAreaUtil to generate the html content by parsing the xml response.
 * Store the response in cachingMap.
 * Call the setHtml method to insert the generated html into the div tag.
 */
function features_tab(xmlResp,whichTabCheck,sourceType){
	xmlResp = xmlResponse;
	var featureTab = '<div class="MOD_FO_6a MOD_GC_22afc"><p class="expand_collapse"> <a href="javascript:void(0)" class="collapse_all topCollapse"><span>'+CollapseAll+'</span></a> <a href="javascript:void(0)" class="expand_all topExpand"><span>'+ExpandAll+'</span></a></p><span class="collapsable_panel">';

	if($(xmlResp).find('key_features').attr('title')!=undefined)
	{
		featureTab = featureTab +'<h3><a href="javascript:void(0)">' +$(xmlResp).find('key_features').attr('title')+'</a></h3>';
		featureTab = featureTab + '<div>' + parseFeatureArticle($(xmlResp).find('key_features').children(), '',"tab",sourceType) + '</div>';
	}

	featureTab = featureTab + parseFunctionalAreaUtil(xmlResp,"tab",sourceType) + '</span><p class="expand_collapse"><a href="javascript:void(0)" class="collapse_all"><span>'+CollapseAll+'</span></a> <a href="javascript:void(0)" class="expand_all"><span>'+ExpandAll+'</span></a></p></div>';
	cachingMap.set('features',featureTab);
	setHtml(featureTab,'features','');
}

/* Handle the features tab content.
 * Call parseFeatureArticle & parseFunctionalAreaUtil to generate the html content by parsing the xml response.
 * Store the response in cachingMap.
 * Call the setHtml method to insert the generated html into the div tag.
 */
function features_group(xmlResp,whichTabCheck){
	var featureGroup = '<div class="MOD_GC_22afc feature_group">';
	if($(xmlResp).find('\\key_features').attr('title')!=undefined)
	{
		featureGroup = featureGroup + '<h3><span>'+$(xmlResp).find('key_features').attr('title')+'</span></h3>';
		featureGroup = featureGroup + '<div class="detail"' + parseFeatureArticle($(xmlResp).find('key_features').children(), '',"group") + '</div>';
		isFirstTabExpanded = true;
	}

	featureGroup = featureGroup + parseFunctionalAreaUtil(xmlResp,"group") + '</div>';
	cachingMap.set('features',featureGroup);
	setHtml(featureGroup,'features','');
}

/* Parse the feature response xml, specifically the contents of 'key_features' in xml.
 * Generate the html
 * @param xmlResp Xml Response to parse.
 * @param className : ClassName to set in the div tag.
 * @param displayType Contains whether it is tab/flat/group
 */
function parseFeatureArticle(xmlResp,className,displayType,sourceType){

	var parseResult = '';

	$(xmlResp).each(function(index)
	{
		var orderId=$(this).attr('order');
		var errorMsg = $(this).find('error').attr('message');
		if(errorMsg!=undefined && errorMsg.length!=0){
			if(displayType=="tab")
			{	
				parseResult = parseResult +'<p style="clear:both">'+'<div class="errMsg" style="display:block">' + errorMsg + '</div>';
				
			}else
			{
				parseResult = parseResult +'<div style="clear:both" class="'+className+'">' + '<div class="errMsg" style="display:block">' + errorMsg + '</div>';

			}


		}
		else{
			var title = $(this).find('title').text();
			var titleHeaderType = $(this).find('title').attr('header_type');
			var summary = $(this).find('summary').text();
			var imgUrl =  $(this).find('img').attr('url');
			var imgaltText =  $(this).find('img').attr('alt_text');

		if(displayType=="tab")
		{	
			if(sourceType=='dcr'){
				if(imgUrl==undefined &&imgaltText==undefined)
				{
								
					parseResult = parseResult +'<span class="keyFeatureTabContent">'+'<'+titleHeaderType+'>'+title+'</'+titleHeaderType+'>'+'<div class="clrfix ptag">'+summary+'</div></span>';		
				}else{

					parseResult = parseResult +'<span class="keyFeatureTabContent"><img src="'+imgUrl+'" alt="'+imgaltText+'" align="left"/>'+'<'+titleHeaderType+'>'+title+'</'+titleHeaderType+'>'+'<div class="clrfix ptag">'+summary+'</div></span>';
				}
			
			}else{
				if(imgUrl==undefined &&imgaltText==undefined)
				{
					parseResult = parseResult +'<span class="keyFeatureTabContent">'+'<'+titleHeaderType+' class="learnMore">'+title+' <span class="ellipse">...</span> </'+titleHeaderType+'><a id="'+orderId+'" href="javascript:void(0)" class="more">'+more+'</a><p></p></span>';		
				}else{
					parseResult = parseResult +'<span class="keyFeatureTabContent"><img src="'+imgUrl+'" alt="'+imgaltText+'" align="left"/>'+'<'+titleHeaderType+' class="learnMore">'+title+' <span class="ellipse">...</span> </'+titleHeaderType+'><a id="'+orderId+'" href="javascript:void(0)" class="more">'+more+'</a><p></p></span>';
				}
			}
		}else
		{
			if(imgUrl==undefined&&imgaltText==undefined){
	        	// Removed Learn More Link as requirement changed for that.. Currently commented
				parseResult = parseResult +'<div style="clear:both" class="'+className+'">'+'<'+titleHeaderType+'>'+title+'</'+titleHeaderType+'>'+'<p>'+summary+'</p>'/*	<a id="'+orderId+'" href="javascript:void(0)" class="more">Learn more</a> */ + '</div>';
			}else{
				// Removed Learn More Link as requirement changed for that.. Currently commented
				parseResult = parseResult +'<div style="clear:both" class="'+className+'"><img src="'+imgUrl+'" alt="'+imgaltText+'" align="left"/>'+'<'+titleHeaderType+'>'+title+'</'+titleHeaderType+'>'+'<p>'+summary+'</p>'/*	<a id="'+orderId+'" href="javascript:void(0)" class="more">Learn more</a> */ + '</div>';
			}
				
		}}
	});
	return parseResult;
}

/* Parse the feature response xml, specifically the contents of 'functional_area' in xml.
 * Generate the html
 * @param xmlResp Xml Response to parse.
 * @param displayType Contains whether it is tab/flat/group
 */
function parseFunctionalAreaUtil(xmlResp,displayType,sourceType){

	var functionalParseResult = '';

	$(xmlResp).find('functional_area').each(function(index)
	{
		var orderId=$(this).attr('order');
		var title = $(this).attr('title');
		
		if($(this).children().get(0)!=undefined){

			if($(this).children().get(0).nodeName=='ERROR'||$(this).children().get(0).nodeName=='error')
			{
				if(displayType=="group")
				{
					var errorMsg = $($(this).children().get(0)).attr('message');
					functionalParseResult = functionalParseResult + '<h3 id="'+orderId+'">' + title + '</h3><div class="detail"><div class="errMsg" style="display:block">'+errorMsg+'</div></div>';
				}
				if(displayType=="tab")
				{
					var errorMsg = $($(this).children().get(0)).attr('message');
					functionalParseResult = functionalParseResult + '<h3 id="'+orderId+'"><a href="javascript:void(0)">'+title+'</a></h3><div class="detail"><div class="errMsg" style="display:block">'+errorMsg+'</div></div>';
				}
			}
		else
		{
			var subResult = parseFeatureArticle($(this).children(),'',displayType,sourceType);
			if(displayType=="group")
			{
				functionalParseResult = functionalParseResult + '<h3 id="'+orderId+'">'+title+'</h3><div class="detail">'+subResult+'</div>';
			}
			if(displayType=="tab")
			{
				if(index==0){
					if(isFirstTabExpanded){
						functionalParseResult = functionalParseResult + '<h3 id="'+orderId+'"><a href="javascript:void(0)">'+title+'</a></h3><div class="MOD_FO_6panel" style="overflow:hidden;">'+subResult+'</div>';
					}else{
						functionalParseResult = functionalParseResult + '<h3 id="'+orderId+'" class="open"><a href="javascript:void(0)">'+title+'</a></h3><div class="MOD_FO_6panel" style="display: block;overflow:hidden;">'+subResult+'</div>';
					}
				}else{
					functionalParseResult = functionalParseResult + '<h3 id="'+orderId+'"><a href="javascript:void(0)">'+title+'</a></h3><div class="MOD_FO_6panel" style="overflow:hidden;">'+subResult+'</div>';
				}
				
			}
			
		 }
		}
	});
	return functionalParseResult;
}

/* Handle the Specifications flat content.
 * Call parseSpecification to generate the html content by parsing the xml response.
 * Store the response in cachingMap.
 * Call the setHtml method to insert the generated html into the div tag.
 */ 
function specs_flat(xmlResp,whichTabCheck){

	var exportToPdfUrl=$(xmlResp).find('pdf_url').text();
	var htmlResult = '<div class="MOD_FO_6b_new">';
	if(basecode==null||basecode==undefined){
		htmlResult = htmlResult + parseSpecification($(xmlResp).find('Specifications').children()) + '<a href="/wps/PA_crp_'+runtime_env+'/getSpecsDataAsExcel?dcr_path='+dcrPath+'" class="xls">'+exportToExcel+'</a></div>';

	}else{
		htmlResult = htmlResult + parseSpecification($(xmlResp).find('Specifications').children()) + '<a href="/wps/PA_crp_'+runtime_env+'/getSpecsDataAsExcel?dcr_path='+dcrPath+'&base_code='+encodeURIComponent(basecode)+'" class="xls">'+exportToExcel+'</a></div>';
	}
		
	if(exportToPdfUrl != null && exportToPdfUrl != undefined && exportToPdfUrl !='') {
			if(exportToPdf != null && exportToPdf != undefined && exportToPdf !='') {
				htmlResult = htmlResult + '<div class="export-pdf"> <a target="_blank" href="'+exportToPdfUrl+'">'+exportToPdf+'</a></div>'
			} else{
				htmlResult = htmlResult + '<div class="export-pdf"> <a target="_blank" href="'+exportToPdfUrl+'">'+exportToPdfDefaultLabel+'</a></div>'
				}
	}

		if(basecode==null){
			cachingMap.set('specifications',htmlResult);
		}else{
			cachingMap.set(basecode,htmlResult);
		}
		basecode = null;
	whichTab = false;
	setHtml(htmlResult,'specifications','');
	}

/* Handle the Specifications group content.
 * Call parseSpecification & parseSpecificationSets to generate the html content by parsing the xml response.
 * Store the response in cachingMap.
 * Call the setHtml method to insert the generated html into the div tag.
 */ 
function specs_group(xmlResp){
	var exportToPdfUrl=$(xmlResp).find('pdf_url').text();
	var specsTabResult = '<div class="MOD_FO_6a specs">	<p class="expand_collapse"> <a href="javascript:void(0)" class="collapse_all topCollapse"><span>'+CollapseAll+'</span></a> <a href="javascript:void(0)" class="expand_all topExpand"><span>'+ExpandAll+'</span></a> </p><span class="collapsable_panel">';

	if($(xmlResp).find('key_specifications').attr('title')!=undefined)
	{
		specsTabResult = specsTabResult +'<h3 class="open"><a href="javascript:void(0)">' +$(xmlResp).find('key_specifications').attr('title')+'</a></h3>';
		specsTabResult = specsTabResult + '<div style="display: block;overflow: hidden;">' + parseSpecification($(xmlResp).find('key_specifications').children(), '',"tab") + '</div>';
		isFirstTabExpanded = true;
	}

	if(basecode==null||basecode==undefined){
		specsTabResult = specsTabResult + parseSpecificationSets(xmlResp) +'</span><a href="/wps/PA_crp_'+runtime_env+'/getSpecsDataAsExcel?dcr_path='+dcrPath+'" class="xls">'+exportToExcel+'</a><p class="expand_collapse"> <a href="javascript:void(0)" class="collapse_all"><span>'+CollapseAll+'</span></a> <a href="javascript:void(0)" class="expand_all"><span>'+ExpandAll+'</span></a></p></div>';
	}else{
		specsTabResult = specsTabResult + parseSpecificationSets(xmlResp) +'</span><a href="/wps/PA_crp_'+runtime_env+'/getSpecsDataAsExcel?dcr_path='+dcrPath+'&base_code='+encodeURIComponent(basecode)+'" class="xls">'+exportToExcel+'</a><p class="expand_collapse"> <a href="javascript:void(0)" class="collapse_all"><span>'+CollapseAll+'</span></a> <a href="javascript:void(0)" class="expand_all"><span>'+ExpandAll+'</span></a></p></div>';
	}
	
	 if(exportToPdfUrl != null && exportToPdfUrl != undefined && exportToPdfUrl !='') {
		  if(exportToPdf != null && exportToPdf != undefined && exportToPdf !='') {
                specsTabResult = specsTabResult + '<div class="export-pdf"> <a target="_blank" href="'+exportToPdfUrl+'">'+exportToPdf+'</a></div>';
			} else{
					specsTabResult = specsTabResult + '<div class="export-pdf"> <a target="_blank" href="'+exportToPdfUrl+'">'+exportToPdfDefaultLabel+'</a></div>';
			}
        }

	if(basecode==null){
		cachingMap.set('specifications',specsTabResult);
	}else{
		cachingMap.set(basecode,specsTabResult);
	}
	basecode = null;
	whichTab = false;
	setHtml(specsTabResult,'specifications' );
}

/* Handle the Specifications pdf content.
 * Store the response in cachingMap.
 * Call the setHtml method to insert the generated html into the div tag.
 */
function specs_pdf(xmlResp){
	var specs_pdfResult = '<div class="MOD_GC_23b">';
	var titleHeaderType=$(xmlResp).find('title').attr("header_type");
	var title=$(xmlResp).find('title').text();
	var url = $(xmlResp).find('url').text();
	var urlText=$(xmlResp).find('url_text').text();
	var description = $(xmlResp).find('description').text();

	specs_pdfResult = specs_pdfResult+'<'+titleHeaderType+'>'+title+'</'+titleHeaderType+'>'+'<p>'+description+'</p>'+ '<a class="pdf" href="'+url+'" target="_blank">'+urlText+'</a>';
	specs_pdfResult = specs_pdfResult + '</div>';

	if(basecode==null){
		cachingMap.set('specifications',specs_pdfResult);
	}else{
		cachingMap.set(basecode,specs_pdfResult);
	}
	basecode = null;
	whichTab = false;
	setHtml(specs_pdfResult,'specifications','');
}

/* Handle the Specifications html content.
 * Store the response in cachingMap.
 * Call the setHtml method to insert the generated html into the div tag.
 */
function specs_html(xmlResp){
	var specs_htmlResult = '<div class="MOD_GC_23b">';
	var titleHeaderType=$(xmlResp).find('title').attr("header_type");
	var title=$(xmlResp).find('title').text();
	var url = $(xmlResp).find('url').text();
	var urlText=$(xmlResp).find('url_text').text();
	var description = $(xmlResp).find('description').text();

	specs_htmlResult = specs_htmlResult+'<'+titleHeaderType+'>'+title+'</'+titleHeaderType+'>'+'<p>'+description+'</p>'+ '<a class="html" href="'+url+'" target="_blank">'+urlText+'</a>';
	specs_htmlResult = specs_htmlResult + '</div>';

	if(basecode==null){
		cachingMap.set('specifications',specs_htmlResult);
	}else{
		cachingMap.set(basecode,specs_htmlResult);
	}
	basecode = null;
	whichTab = false;
	setHtml(specs_htmlResult,'specifications','');
}

/* Parse the Specification response xml, specifically the contents of 'key_specifications' in xml.
 * Generate the html
 * @param xmlResp Xml Response to parse.
 */
function parseSpecification(xmlResp){

	var htmlResult = '<table style="border-collapse: collapse;" width="100%">';
	$(xmlResp).each(function(index)
			{
		var name=$($(this).find('name')[0]).text();
		/*var value = $($(this).find('value')[0]).text();*/
		var values = parseValueAttribute($(this).children('values'));/*RS */
		var unit=$($(this).find('unit')[0]).text();
		var subAttrLength = $(this).find('sub_attribute').length;
		var classStr = (index%2==0==0)?"bg":"";
		if(name!='')
				{
		htmlResult = htmlResult+'<tr class=\"'+classStr+'\"><td><span>'+name+'</span></td><td>'+values+'</td></tr>';
				}
		if(subAttrLength>0){
			$(this).find('sub_attribute').each(function(subIndex){
				var subName=$($(this).find('name')[0]).text();
				/*var subValue = $($(this).find('value')[0]).text();*/
				var subValues = parseValueAttribute($(this).children('values'));/*RS */
				var subUnit=$($(this).find('unit')[0]).text();
				htmlResult = htmlResult+'<tr class=\"'+classStr+'\"><td><span class="sub_attribute">'+subName+'</span></td><td>'+subValues+'</td></tr>';
				
			});
		}
			});
	htmlResult = htmlResult+'</table>';
	return htmlResult;
}

/* Parse the Specification response xml, specifically the contents of 'specification_set' in xml.
 * Generate the html
 * @param xmlResp Xml Response to parse.
 */
function parseSpecificationSets(xmlResp){
	var specificationSetResult = '';
	var subResult = '';

	$(xmlResp).find('specification_set').each(function(index)
		{
			var specstitle = $(this).attr('title');
			if($(this).children()[0] != undefined) {				
				if(($(this).children()[0]).nodeName == 'specification')
				{		
					subResult = parseSpecification($(this).children());
				} else if(($(this).children()[0]).nodeName == 'specification_rating_set') 
				{
					subResult = parseRatingSpecificationSet($(this).children());
				}
			} 
			if(index==0){
				if(isFirstTabExpanded){
					specificationSetResult = specificationSetResult + '<h3><a href="javascript:void(0)">'+specstitle+'</a></h3><div class="MOD_FO_6Specs"  style="overflow:hidden;">'+subResult+'</div>';
				}else{
					specificationSetResult = specificationSetResult + '<h3 class="open"><a href="javascript:void(0)">'+specstitle+'</a></h3><div class="MOD_FO_6Specs"  style="display: block;overflow:hidden;" >'+subResult+'</div>';
				}
					
			}else
			{
				specificationSetResult = specificationSetResult + '<h3><a href="javascript:void(0)">'+specstitle+'</a></h3><div class="MOD_FO_6Specs" style="overflow:hidden;">'+subResult+'</div>';
			}		
		});
	return specificationSetResult;
}

/* Parse the Specification response xml, specifically the contents of 'key_specifications' in xml.
 * Generate the html
 * @param xmlResp Xml Response to parse.
 */
function parseRatingSpecificationSet(xmlResp){	
	var specificationRatingSetResult = '';

	$(xmlResp).each(function(index)
		{
			var specstitle = $(this).attr('title');			
			var subRatingResult = parseRatingSpecification($(this).children());
			
			if(specstitle == '--') 
			{
				specificationRatingSetResult = specificationRatingSetResult + '<table style="border-collapse: collapse;" width="100%">'+subRatingResult + '</table>';
		  } else
		  {
		  	specificationRatingSetResult = specificationRatingSetResult + '<table style="border-collapse: collapse;" width="100%"><tr class="JDPSProdClass" width="100%"><td width="100%">'+ specstitle+ '</td></tr>' +subRatingResult+ '</table>';
		  }
			
		});
		
	return specificationRatingSetResult;
}

/* Parse the Specification response xml, specifically the contents of 'key_specifications' in xml.
 * Generate the html
 * @param xmlResp Xml Response to parse.
 */
function parseRatingSpecification(xmlResp){

	var htmlRatingResult = '';
	$(xmlResp).each(function(index)
			{
		var name=$($(this).find('name')[0]).text();
		var value = $($(this).find('value')[0]).text();
		var unit=$($(this).find('unit')[0]).text();
		var subAttrLength = $(this).find('sub_attribute').length;
		var classStr = (index%2==0==0)?"bg":"bg";
		htmlRatingResult = htmlRatingResult+'<tr class=\"'+classStr+'\"><td><span>'+name+'</span></td><td>'+value+' '+unit+'</td></tr>';
		if(subAttrLength>0){
			$(this).find('sub_attribute').each(function(subIndex){
				var subName=$($(this).find('name')[0]).text();
				var subValue = $($(this).find('value')[0]).text();
				var subUnit=$($(this).find('unit')[0]).text();
					htmlRatingResult = htmlRatingResult+'<tr class=\"'+classStr+'\"><td><span class="sub_attribute">'+subName+'</span></td><td>'+subValue+' '+subUnit+'</td></tr>';
			});
		}
			});
	htmlRatingResult = htmlRatingResult;

	return htmlRatingResult;
}

function features(xmlResp){
	feature_article_detail(xmlResp);	
}
/*
The compatible method handles the XML that comes from the Server Request /getConfiguratorMoreData
This request is generated on clicking the more link on the Webservices Accordion in Compatible Equip Tab of model DCR.
*/

function compatible(xmlResp){
	feature_article_detail_compatible(xmlResp);	
}


/* Handle the Learn More response and displaying of lightbox from the Server Request /getConfiguratorMoreData.
 * Call lmNextPreviousLinkData function to generate the next and previous link on the lightbox.
 * Call the parseFeatureArticlePara to parse the 'article_paragraphs' in the xml response.
 * Store the response in cachingMap.
 * Call the setHtml method to insert the generated html into the div tag.
 */
function feature_article_detail_compatible(xmlResp){
	var learnMoreHeader = '';
	var learnMoreCacheArray = [];

	var learnMoreResult ='';
	var lmPrevOrderId = '';
	var lmNextOrderId = '';
	var headerType = $(xmlResp).find('header').attr('header_type');
	var header = $(xmlResp).find('header').first().text();
	$('.modal p.title').html(header);
	learnMoreResult = learnMoreResult + '<div class="item scroll on"  id='+ cachingMap.get("attachID")+'">';
	if($(xmlResp).find('error').length!=0)
	{
		learnMoreResult = learnMoreResult + '<div class="errMsg" style="display:block">'+$(xmlResp).find('error').attr('message')+ '</div>';
	}else
	{
	learnMoreResult = learnMoreResult + parseFeatureArticlePara($(xmlResp).find('article_paragraphs').children()) +'</div>';
	}
	learnMoreCacheArray[0] = lmPrevOrderId;
	learnMoreCacheArray[1] = lmNextOrderId;
	learnMoreCacheArray[2] = learnMoreResult;
	learnMoreCacheArray[3] = header;
	cachingMap.set(cachingMap.get('attachID'), learnMoreCacheArray);
	setHtml(learnMoreResult,'configuratorLearnMore','');
}


/* Handle the Learn More response and displaying of lightbox.
 * Call lmNextPreviousLinkData function to generate the next and previous link on the lightbox.
 * Call the parseFeatureArticlePara to parse the 'article_paragraphs' in the xml response.
 * Store the response in cachingMap.
 * Call the setHtml method to insert the generated html into the div tag.
 */
function feature_article_detail(xmlResp){
	var learnMoreHeader = '';
	var learnMoreCacheArray = [];

	var learnMoreResult ='';
	var lmPrevOrderId = $(xmlResp).find('prev').attr('order');
	var lmNextOrderId = $(xmlResp).find('next').attr('order');
	var headerType = $(xmlResp).find('header').attr('header_type');
	var header = $(xmlResp).find('header').first().text();
	if(lmPrevOrderId==undefined)
	{
		lmPrevOrderId = '';
	}
	if(lmNextOrderId==undefined)
	{
		lmNextOrderId = '';
	}
	$('.modal p.title').html(header);
	lmNextPreviousLinkData(lmPrevOrderId, lmNextOrderId);

	learnMoreResult = learnMoreResult + '<div class="item scroll on"  id='+ cachingMap.get("orderId")+'">';
	if($(xmlResp).find('error').length!=0)
	{
		learnMoreResult = learnMoreResult + '<div class="errMsg" style="display:block">'+$(xmlResp).find('error').attr('message')+ '</div>';
	}else
	{
	learnMoreResult = learnMoreResult + parseFeatureArticlePara($(xmlResp).find('article_paragraphs').children()) +'</div>';
	}
	learnMoreCacheArray[0] = lmPrevOrderId;
	learnMoreCacheArray[1] = lmNextOrderId;
	learnMoreCacheArray[2] = learnMoreResult;
	learnMoreCacheArray[3] = header;
	cachingMap.set(cachingMap.get('orderId'), learnMoreCacheArray);
	setHtml(learnMoreResult,'learnMore','');
}
/**
 * Handle the series specification tab.
 */
function series_specs(xmlResp,whichTabCheck){
	var headHtml = modelSpecUtil($(xmlResp).find('series_models').children(),whichTabCheck);
	seriesXML = seriesSpecUtil($(xmlResp).find('series_specification_sets').children(),headHtml,whichTabCheck);

	if(whichTabCheck=='specifications'){
		if(basecode==null){
			cachingMap.set('specifications',seriesXML);
		}else{
			cachingMap.set(basecode,seriesXML);
		}
	}else if(whichTabCheck=='compareSpec'){
		if(baseCodeCompareSpecs==null){
			cachingMap.set(baseCodeCompareSpecs+'compareSpec',seriesXML);
		}else{
			cachingMap.set(baseCodeCompareSpecs+'compareSpec',seriesXML);
		}
	}
	basecode = null;
	setHtml(seriesXML,whichTabCheck);
}

/**
 * Generates the head part of the html and stores it in a variable. 
 * Also calculates the array of model names.
 */
function modelSpecUtil(xmlResp,whichTabSpecs){
	var tableHeadHtml = '<thead><tr><th class="none"></th>';
	var showModelcnt=1;
	var modelSpecID;
	showModels.clear();
	var model_names = new HashMap();
	$(xmlResp).each(function(index){
		modelSpecID = $(this).attr('model_id');
		model_name = $(this).text();
		manufacture_name = $(this).attr('manufacture_name');
		manufactureMap.set(index, manufacture_name);
		model_names.set(modelSpecID, model_name);
		showModels.set(showModelcnt,('td_1_'+showModelcnt+" td_col_"+showModelcnt));
		if(whichTabSpecs=="compareSpec"){
			tableHeadHtml=tableHeadHtml+'<th class="td_1_'+(index+1)+' td_col_'+(index+1)+'"><div class="close_Container"><a href="javascript:void(0)" class="close">x</a></div> <span class="manufacturerName">'+manufacture_name+'</span><span class="modelName">'+model_name+'</span></th>';
			if(baseCodeCompareSpecs!=null && baseCodeCompareSpecs!='' && baseCodeCompareSpecs!='null'){
				model_namesCache.set(baseCodeCompareSpecs+whichTabSpecs, model_names);
				currentRTable.currentTabBaseCode = baseCodeCompareSpecs+whichTabSpecs;
			}else{
				model_namesCache.set(whichTabSpecs, model_names);
				currentRTable.currentTabBaseCode = whichTabSpecs;
			}
		}else if(whichTabSpecs == "specifications"){
			tableHeadHtml=tableHeadHtml+'<th class="td_1_'+(index+1)+' td_col_'+(index+1)+'"><div class="close_Container"><a href="javascript:void(0)" class="close">x</a></div> <span>'+model_name+'</span></th>';
			if(basecode!=null && basecode!='' && basecode!='null'){
				model_namesCache.set(basecode+whichTabSpecs, model_names);
				currentRTable.currentTabBaseCode = baseCodeCompareSpecs+whichTabSpecs;
			}else{
				model_namesCache.set(whichTabSpecs, model_names);
				currentRTable.currentTabBaseCode = whichTabSpecs;
			}
		}
		
		showModelcnt=showModelcnt+1;
	});
	
	tableHeadHtml = tableHeadHtml + '</tr></thead>';
	return tableHeadHtml;
}

/**
 * Generates the body for key specification and specification.
 * @param xmlResp the xml response
 * @param HeadHtml the head part of the html
 */
function seriesSpecUtil(xmlResp,HeadHtml,whichTabSpecs){
	
	var table = '';
	var modelSizeCal = '';
	var modelSize='';
	var paginataModelSize = model_namesCache.get(currentRTable.currentTabBaseCode).size();
	var model_names = "";
	var tempbasecode = '';
	modelsToExport = '';
	
	if(whichTabSpecs=='compareSpec'){
		table = 'rTable';
		modelSizeCal = 2;
		paginataModelSize = paginataModelSize -1;
		model_names = model_namesCache.get(currentRTable.currentTabBaseCode);
		modelSize = model_names.size();
		tempbasecode = tempCompBaseCode;
		
	}
	if(whichTabSpecs=='specifications'){
		table = 'rTable';
		modelSizeCal = (leftNavPage)? 2 : 3;/*RS June29 for leftnav modelSize is 2 and for other its 3*/
		model_names = model_namesCache.get(currentRTable.currentTabBaseCode);
		modelSize = model_names.size();
		tempbasecode = tempSpecsBaseCode;
	}
	
	var modalColClass;
	var parseResult = '<div class="MOD_FO_6b"><div class="addRemoveModel"> <a href="javascript:void(0)">close</a><p class="title">'+chooseModelsShownOnSpecs + '</p><ul>';
	
	for(var j=0;j<modelSize;j++){
		if((j+1)%4==0)
			modalColClass = 'last';
		else
			modalColClass = '';
		
		parseResult = parseResult + '<li class="'+modalColClass+'"><input name="list" type="checkbox" id="td_1_'+(j+1)+'" /><label for="td_1_'+(j+1)+'">'+manufactureMap.valArray[j]+" " +model_names.valArray[j]+'</label></li>';
	}
	
	parseResult +=  '</ul><a href="javascript:void(0)" class="apply" id="remModels"><span>'+ langApply +'</span></a></div><div class="clrfix model">';
	
	//parseResult +=  '</ul><input id="remModels" class="apply" type="image" src="/common/deere-resources/img/btn_apply.jpg" alt="Apply" /></div><div class="clrfix model">';
	/*DD artf1239907 Removed input field and added an expandable and localized button. */
	
	if(leftNavPage && modelSize >=2){/*RS June29 creation of initial to - from at top header*/
		parseResult = parseResult + '<p class="itemModel">1 - 2 '+langOF+' ' +modelSize +' ' + modelsDisplayed +' <a class="showAll" href="javascript:void(0)">'+showAllModels+'</a> <span class="pipe">|</span>  <a href="javascript:void(0)" class="chooseModels">'+AddRemoveModels+'</a></p>';
	}
	else if(modelSize >=3){
		parseResult = parseResult + '<p class="itemModel">1 - 3 '+langOF+' ' +modelSize +' ' + modelsDisplayed +' <a class="showAll" href="javascript:void(0)">'+showAllModels+'</a> <span class="pipe">|</span>  <a href="javascript:void(0)" class="chooseModels">'+AddRemoveModels+'</a></p>';
	}
	else{
		parseResult = parseResult + '<p class="itemModel">1 - '+ modelSize +' ' +langOF+' ' +modelSize+ ' ' + modelsDisplayed +' <a class="showAll" href="javascript:void(0)">'+showAllModels+'</a> <span class="pipe">|</span>  <a href="javascript:void(0)" class="chooseModels">'+AddRemoveModels+'</a></p>';
	}
	parseResult = parseResult +'<p class="expand_collapse"> <a href="javascript:void(0)" class="collapse_all topCollapse"><span>'+CollapseAll+'</span></a> <a href="javascript:void(0)" class="expand_all topExpand"><span>'+ExpandAll+'</span></a></p>'+
	'</div>';
	
	if (paginataModelSize % modelSizeCal == 0) {
		ttl_page = paginataModelSize / modelSizeCal;
	} else {
		ttl_page = parseInt(paginataModelSize / modelSizeCal) + 1;
	}
	var paginateDots = '';
	for(var k=0;k<ttl_page;k++){
		if (k==0) {
			paginateDots += '<a href="javascript:void(0)" rel='+k+' class="p'+k+' on">' + (k + 1) + '</a>';
		} else {
			paginateDots += '<a href="javascript:void(0)" rel='+k+' class="p'+k+'">' + (k + 1) + '</a>';
		}
	}	
	$(xmlResp).each(function(index){
		$(this).each(function(index1){
			var title = $(this).attr('title').toUpperCase();
			if(index==0){
				parseResult =parseResult + '<h3 class="open"><a href="javascript:void(0)">'+title+'</a></h3>';
			}
			else{
				parseResult = parseResult + '<h3><a href="javascript:void(0)">'+title+'</a></h3>';
				}
				parseResult = parseResult + '<div class="'+table+'"> <span class="tablepag"> <a class="prev_column" href="javascript:void(0)">prev</a> <span>';
				
				parseResult += paginateDots;
				
				parseResult = parseResult + '</span> <a class="next_column" href="javascript:void(0)">next</a> </span>'+
				'<div class="scroll tablediv2">'+
			'<table cellspacing="0" cellpadding="0">' + HeadHtml + '<tbody>';

			$(this).find('series_specification').each(function(index){
				var specTitle = $(this).attr('title');
				var classStr = ((index+1)%2==0)?"bg":"bg1";
				var subAttrClass = ((index+1)%2==0)?"bg sub_attribute_row":"bg1 sub_attribute_row1";
				
				parseResult = parseResult + '<tr class="'+classStr+'"><td style="width: '+ colWidth +' ! important;"><span>'+specTitle+'</span></td>';
				
				var ctr = 0;
				var model_specificationArr = $(this).find('model_specification');
				var model_specificationArrLen = $(this).find('model_specification').length;
				var subAttributesArrLen = $(this).find('sub_attributes').length;
				for(var cntCol=1;cntCol<=modelSize;cntCol++) {
					if(ctr<model_specificationArrLen) {
						_this = model_specificationArr[ctr];
						if(_this.getElementsByTagName('model_id')[0].firstChild) {
							var modelIDFetched = _this.getElementsByTagName('model_id')[0].firstChild.nodeValue;
						}
						if(cntCol==modelIDFetched) {
							/*RS */
							/*if(_this.getElementsByTagName('value')[0].firstChild) {
								var value = _this.getElementsByTagName('value')[0].firstChild.nodeValue;
							} else {
								var value = '';
							}
							if(_this.getElementsByTagName('unit')[0].firstChild) {
								var unit = _this.getElementsByTagName('unit')[0].firstChild.nodeValue;
							} else {
								var unit = '';
							}
							var modelDisplayName = value+' '+unit;*/
							var modelDisplayName = parseValueAttribute($(_this).children('values'));
							
							if(modelDisplayName!=''){
								parseResult = parseResult + '<td class="td_'+(index+1)+'_'+cntCol+' td_col_'+cntCol+'" style="width: '+ colWidth +' ! important;">'+modelDisplayName +'</td>';
							} else {
								parseResult = parseResult + '<td class="td_'+(index+1)+'_'+cntCol+' td_col_'+cntCol+'" style="width: '+ colWidth +' ! important;">---</td>';
							}
							ctr++;
						}
						else{
							parseResult = parseResult + '<td class="td_'+(index+1)+'_'+cntCol+' td_col_'+cntCol+'" style="width: '+ colWidth +' ! important;">---</td>';
						}
					} else if(model_specificationArrLen<modelSize) {
						parseResult = parseResult + '<td class="td_'+(index+1)+'_'+cntCol+' td_col_'+cntCol+'" style="width: '+ colWidth +' ! important;">---</td>';
					}
				}
				parseResult = parseResult + '</tr>';
				if(subAttributesArrLen >0){
					$(this).find('sub_attributes').each(function(subAttributesCnt){
						var subAttrTitle = $(this).attr('title');
					var subAttrCtr=0;
					var subAttributeArr = $(this).find('sub_attribute');
					var subAttributeArrLen = $(this).find('sub_attribute').length;
					parseResult = parseResult + '<tr class="'+subAttrClass+'"><td style="width: '+ colWidth +' ! important;"><div class="sub_attribute">'+subAttrTitle+'</div></td>';
					for(var cntCol=1;cntCol<=modelSize;cntCol++) {
						if(subAttrCtr<subAttributeArrLen) {
							_subthis = subAttributeArr[subAttrCtr];
							if(_subthis.getElementsByTagName('model_id')[0].firstChild) {
								var modelIDFetched = _subthis.getElementsByTagName('model_id')[0].firstChild.nodeValue;
							}
							if(cntCol==modelIDFetched) {
								/*RS */
								/*if(_subthis.getElementsByTagName('value')[0].firstChild) {
									var value = _subthis.getElementsByTagName('value')[0].firstChild.nodeValue;
								} else {
									var value = '';
								}
								if(_subthis.getElementsByTagName('unit')[0].firstChild) {
									var unit = _subthis.getElementsByTagName('unit')[0].firstChild.nodeValue;
								} else {
									var unit = '';
								}
								var modelDisplayName = value+' '+unit;*/
								var modelDisplayName = parseValueAttribute($(_subthis).children('values'));
								if(modelDisplayName!=''){
									parseResult = parseResult + '<td class="td_'+(subAttributesCnt+1)+'_'+cntCol+' td_col_'+cntCol+'" style="width: '+ colWidth +' ! important;">'+modelDisplayName +'</td>';
								} else {
									parseResult = parseResult + '<td class="td_'+(subAttributesCnt+1)+'_'+cntCol+' td_col_'+cntCol+'" style="width: '+ colWidth +' ! important;"><div>---</div></td>';
								}
								subAttrCtr++;
							}
							else{
								parseResult = parseResult + '<td class="td_'+(subAttributesCnt+1)+'_'+cntCol+' td_col_'+cntCol+'" style="width: '+ colWidth +' ! important;"><div>---</div></td>';
							}
						} else if(model_specificationArrLen<modelSize) {
							parseResult = parseResult + '<td class="td_'+(subAttributesCnt+1)+'_'+cntCol+' td_col_'+cntCol+'" style="width: '+ colWidth +' ! important;"><div>---</div></td>';
						}
					}
					});
				}
			});
			parseResult = parseResult +'</tbody></table></div></div>';
		});
	});
	
	parseResult = parseResult + '<div class="clrfix model"> <p class="expand_collapse"> <a href="javascript:void(0)" class="collapse_all"><span>'+CollapseAll+'</span></a> <a href="javascript:void(0)" class="expand_all"><span>'+ExpandAll+'</span></a></p>';
	if(modelSize >=3){
		if(tempbasecode==null||tempbasecode==undefined){
			if(whichTabSpecs!='compareSpec'){
				parseResult = parseResult + '<p class="itemModel">1 - 3 '+langOF+' ' +modelSize +' ' + modelsDisplayed +' <a class="showAll" href="javascript:void(0)">'+showAllModels+'</a> <span class="pipe">|</span> <a href="javascript:void(0)" class="chooseModels">'+AddRemoveModels+'</a></p></div><p><a href="/wps/PA_crp_'+runtime_env+'/getCompareSpecsDataAsExcel?dcr_path='+dcrPath+'&modelId='+modelsToExport+'" class="xls">'+exportToExcel+'</a></p>';

			}else{
				parseResult = parseResult + '<p class="itemModel">1 - 3 '+langOF+' ' +modelSize +' ' + modelsDisplayed +' <a class="showAll" href="javascript:void(0)">'+showAllModels+'</a> <span class="pipe">|</span> <a href="javascript:void(0)" class="chooseModels">'+AddRemoveModels+'</a></p></div><p><a href="/wps/PA_crp_'+runtime_env+'/getCompareSpecsDataAsExcel?dcr_path='+dcrPath+'&modelId='+modelsToExport+'" class="xls">'+exportToExcelCompare+'</a></p>';
				exportToExcelUrl = '/wps/PA_crp_'+runtime_env+'/getCompareSpecsDataAsExcel?';
			}
			
		}else{
			if(whichTabSpecs!='compareSpec'){
				parseResult = parseResult + '<p class="itemModel">1 - 3 '+langOF+' ' +modelSize +' ' + modelsDisplayed +' <a class="showAll" href="javascript:void(0)">'+showAllModels+'</a> <span class="pipe">|</span> <a href="javascript:void(0)" class="chooseModels">'+AddRemoveModels+'</a></p></div><p><a href="/wps/PA_crp_'+runtime_env+'/getCompareSpecsDataAsExcel?dcr_path='+dcrPath+'&base_code='+encodeURIComponent(tempbasecode)+'&modelId='+modelsToExport+'" class="xls">'+exportToExcel+'</a></p>';
			}else{
				parseResult = parseResult + '<p class="itemModel">1 - 3 '+langOF+' ' +modelSize +' ' + modelsDisplayed +' <a class="showAll" href="javascript:void(0)">'+showAllModels+'</a> <span class="pipe">|</span> <a href="javascript:void(0)" class="chooseModels">'+AddRemoveModels+'</a></p></div><p><a href="/wps/PA_crp_'+runtime_env+'/getCompareSpecsDataAsExcel?dcr_path='+dcrPath+'&base_code='+encodeURIComponent(tempbasecode)+'&modelId='+modelsToExport+'" class="xls">'+exportToExcelCompare+'</a></p>';
				exportToExcelUrl = '/wps/PA_crp_'+runtime_env+'/getCompareSpecsDataAsExcel?';
			}
		}
	
		
	}
	else{

		if(tempbasecode==null||tempbasecode==undefined){
			if(whichTabSpecs!='compareSpec'){
				parseResult = parseResult + '<p class="itemModel">1 - '+ modelSize +' '+langOF+' ' + modelSize +' ' + modelsDisplayed +' <a class="showAll" href="javascript:void(0)">'+showAllModels+'</a> <span class="pipe">|</span> <a href="javascript:void(0)" class="chooseModels">'+AddRemoveModels+'</a></p></div><p><a href="/wps/PA_crp_'+runtime_env+'/getCompareSpecsDataAsExcel?dcr_path='+dcrPath+'&modelId='+modelsToExport+'" class="xls">'+exportToExcel+'</a></p>';
			}else{
				parseResult = parseResult + '<p class="itemModel">1 - '+ modelSize +' '+langOF+' ' + modelSize +' ' + modelsDisplayed +' <a class="showAll" href="javascript:void(0)">'+showAllModels+'</a> <span class="pipe">|</span> <a href="javascript:void(0)" class="chooseModels">'+AddRemoveModels+'</a></p></div><p><a href="/wps/PA_crp_'+runtime_env+'/getCompareSpecsDataAsExcel?dcr_path='+dcrPath+'&modelId='+modelsToExport+'" class="xls">'+exportToExcelCompare+'</a></p>';
				exportToExcelUrl = '/wps/PA_crp_'+runtime_env+'/getCompareSpecsDataAsExcel?';
			}
			
		}else{
			if(whichTabSpecs!='compareSpec'){
				parseResult = parseResult + '<p class="itemModel">1 - '+ modelSize +' '+langOF+' ' + modelSize +' ' + modelsDisplayed +' <a class="showAll" href="javascript:void(0)">'+showAllModels+'</a> <span class="pipe">|</span> <a href="javascript:void(0)" class="chooseModels">'+AddRemoveModels+'</a></p></div><p><a href="/wps/PA_crp_'+runtime_env+'/getCompareSpecsDataAsExcel?dcr_path='+dcrPath+'&base_code='+encodeURIComponent(tempbasecode)+'&modelId='+modelsToExport+'" class="xls">'+exportToExcel+'</a></p>';
			}else{
				parseResult = parseResult + '<p class="itemModel">1 - '+ modelSize +' '+langOF+' '+modelSize +' ' + modelsDisplayed +' <a class="showAll" href="javascript:void(0)">'+showAllModels+'</a> <span class="pipe">|</span> <a href="javascript:void(0)" class="chooseModels">'+AddRemoveModels+'</a></p></div><p><a href="/wps/PA_crp_'+runtime_env+'/getCompareSpecsDataAsExcel?dcr_path='+dcrPath+'&base_code='+encodeURIComponent(tempbasecode)+'&modelId='+modelsToExport+'" class="xls">'+exportToExcelCompare+'</a></p>';
				exportToExcelUrl = '/wps/PA_crp_'+runtime_env+'/getCompareSpecsDataAsExcel?';
			}
			
		}
	}
	return parseResult;
}
/* Handle the generation of next and previous link on the lightbox.
 * @param lmPrevOrderId : Contains the orderId of Previous Learn More link
 * @param lmNextOrderId : Contains the orderId of Next Learn More link 
 */
function lmNextPreviousLinkData(lmPrevOrderId,lmNextOrderId){
	if(($('.modal .prev').get().length == 0)&&($('.modal .next').get().length == 0)&&(lmPrevOrderId!='')&&(lmNextOrderId!=''))
	{
		$('.modal').append('<a href="javascript:void(0)" class="prev" id="'+lmPrevOrderId+'">prev</a><a href="javascript:void(0)" class="next" id="'+lmNextOrderId+'">next</a>');
	}else
	{
		if($('.modal .prev').length == 0 && (lmPrevOrderId!=''))
		{
			$('.modal').append('<a href="javascript:void(0)" class="prev" id="'+lmPrevOrderId+'">prev</a>');

		}else
		{
			$('.modal .prev').replaceWith('<a href="javascript:void(0)" class="prev" id="'+lmPrevOrderId+'">prev</a>');
		}
		if($('.modal .next').length==0 && lmNextOrderId!='')
		{
			$('.modal').append('<a href="javascript:void(0)" class="next" id="'+lmNextOrderId+'">next</a>');

		}else if(lmNextOrderId!='')
		{
			$('.modal .next').replaceWith('<a href="javascript:void(0)" class="next" id="'+lmNextOrderId+'">prev</a>');
		}
	}
	$('.modal .next, .modal .prev').bind('click',function(){lightBoxNextPrev_Click(this);});
}

/* Handle the parsing of 'article_paragraphs' in XML response.
 * @param xmlResp : XML response of LearnMore link
 */
function parseFeatureArticlePara(xmlResp){
	var lmResult = '';

	$(xmlResp).each(function(index)
			{
		var header=$(this).find('header').text();
		var headerType=$(this).find('header').attr("header_type");
		var description = $(this).find('description').text();
		description = decHTMLifEnc(description);
		lmResult = lmResult + '<div class="MOD_GC_3">';	
		lmResult = lmResult+ '<'+headerType+'>'+header+'</'+headerType + '>' + description +'</div>';
			});
	return lmResult;
}

/* Handle the Compatible tab content.
This hanles the XML thats comes from /getCompatibleTab
also handles the /getAccordionData Request XML
Call parseCompatibleItems to generate the html content by parsing the xml response.	
Store the response in cachingMap.
Call the setHtml method to insert the generated html into the div tag.
 */
function compatible_TAB(xmlResp){
	var compatibleTab;
	if($(xmlResp).find('equipment_set_list').length!=0)
	{   
		compatibleTab = parseCompatibleItems($(xmlResp).find('equipment_set_list').children(),'MOD_FO_6d compatibleEquipment',"tab");
		cachingMap.set('compatible',compatibleTab);
		setHtml(compatibleTab,'compatible','');
		
		/*DD artf1270662, artf1282611 Compatible Equipment Tab Accordin */
		$(".MOD_FO_6d h3:first").trigger('click');
		
	}else if($(xmlResp).find('equipment_set').length!=0)
	{	var source = $(xmlResp).find('equipment_set').attr("source");
		var orderId = $(xmlResp).find('equipment_set').attr("order");
		//this is for the styling of each accordion data that comes up from the WebServices. 
		if(source == 'configurator'){
		compatibleTab = styleCompEquipAccordionFrmWS($(xmlResp).find('equipment_set').children(),'MOD_FO_6d compatibleEquipment',"tab");
		}else{
		compatibleTab = parseCompatibleEquipmentSet($(xmlResp).find('equipment_set').children(),'MOD_FO_6d compatibleEquipment',"tab");
		}
		cachingMap.set(orderId,compatibleTab);
		setHtml(compatibleTab,'compatibleEquipmentSet',orderId);
		
	}
	else if($(xmlResp).find('lightbox').length!=0)
	{
		var orderId = $(xmlResp).find('equipment_set').attr("order");
		compatibleTab = parseCompLightBox($(xmlResp).find('lightbox').children(),'MOD_FO_6d compatibleEquipment',"tab");
		cachingMap.set(orderId,compatibleTab);
		setHtml(compatibleTab,loadingGifMap.get('type'),orderId);
	}
}
 
/*
 * This method parsed the xml response for the compare tab.
 * It will display the content of John Deere product and the competing third party models of the
 * hero product.
 * 
 * Call the model method to parse the models
 * Call the setHtml method to insert the gernated html into the div tag.
 */
function compare(xmlResp){
	var models;
	var baseCode = $($(xmlResp).find('key_model')).find('base_code').text();
	var displayNameCompare = $($(xmlResp).find('key_model')).find('display_name').text();
	models = '<div class="MOD_FO_10"><div class="header"><h2>'+selectModels+ " John Deere " + displayNameCompare +'</h2><a href="javascript:void(0)" title="'+compareModels+'" class="noCompareModels"><span>'+compareModels +'</span></a> </div>';/*DD Added Span for expandable button*/
	// call the model method to parse the model
	models = models + parseModel($(xmlResp).find('compare_models').children(),displayNameCompare);
	models = models +  '</div>';
	cachingMap.set(baseCode+'compare',models);
	baseCodeCompareSpecs = baseCode;
	setHtml(models, "compare",baseCode);
}
/*
 * This method parses the models and store the code , subId in a Map
 * @param model
 * @returns {String}
 */
function parseModel(model,displayNameCompare){
	var parseResult = "";
	var listCompare = '<div class="listCompare"><div class="topCompare"><h3>'+johnDeereModels + '</h3><p><input type="checkbox" name="checkAllAutoLeft" id="checkAllAutoLeft" /><label for="checkAllAutoLeft">'+checkUncheck+'</label></p></div>';
	var listCompare1 = '<div class="listCompare2"><div class="topCompare"><h3>'+competitorModels + '</h3><p><input type="checkbox" name="checkAllAutoRight" id="checkAllAutoRight" /><label for="checkAllAutoRight">'+checkUncheck+'</label></p></div>';
	var jdModels  = "<ul>";
	var competingModels = "<ul>";
	$(model).each(function(index)
			{
		var code=$(this).attr('pci_code');
		var jdModel=$(this).attr('jd_model');
		var subId=$(this).attr('base_code');
		// find the 
		var manufacture_name = $(this).find('manufacture_name').text();
		var display_name = $(this).find('display_name').text();
		var manufacture_code = $(this).find('manufacture_code').text();
		if(index==0){
			jdModels = jdModels +	'<li><input name="modelCode" id="'+displayNameCompare +'" type="checkbox" disabled="disabled" checked="checked"><label for="'+displayNameCompare +'">'+displayNameCompare + '</label></li>';
		}

		if(jdModel!=undefined && jdModel!=''){
			if(jdModel=="Y"||jdModel=="y") {
				jdModels = jdModels +	'<li><input name="modelCode" id="'+manufacture_name+display_name +'" type="checkbox" class="checkLeft"><label for="'+manufacture_name+display_name +'">'+display_name + '</label></li>';
			}else{
				competingModels = competingModels +	'<li><input name="modelCode" value ="'+code +' " id="'+manufacture_name+display_name +'" type="checkbox" class="checkRight"><label for="'+manufacture_name+display_name +'">'+manufacture_name+" "+display_name + '</label></li>';
			}
		}
			});
	listCompare = listCompare + jdModels + '</div>';
	listCompare1 = listCompare1 + competingModels + '</div>';
	parseResult = listCompare + listCompare1;
	return parseResult;

}



/* Parse the compatible Items response xml
   Generate the html
   @param xmlResp Xml Response to parse.
   @param className : ClassName to set in the div tag.
   @param displayType Contains whether it is tab/flat/group
*/
function parseCompatibleItems(xmlResp,className,type){
	var parseResult = '';
	$(xmlResp).each(function(index)
	{
		var orderId=$(this).attr('order');
		var name = $(this).attr('title');
		//var source = $(this).attr('source');

		
		if(type=="tab" && name!='')
		{ 
		parseResult = parseResult + '<h3 id="'+ orderId +'"><a href="javascript:void(0)">'+name+'</a></h3>';
		parseResult = parseResult + '<div id="tab_'+ orderId +'"></div>';
		}
	});
	parseResult = '<div class="'+className+'">' + parseResult + '</div>';
	return parseResult;
	
}

/* Parse the compatible Equipment Set response xml
Generate the html
@param xmlResp Xml Response to parse.
@param className : ClassName to set in the div tag.
@param displayType Contains whether it is tab/flat/group
*/
function parseCompatibleEquipmentSet(xmlResp,className,type){
	var parseResult = '';
	var length = $(xmlResp).length;
	var onePage = 3;
	
	// Call for Pagination	
	parseResult = parseResult + '<div class="page_navigation pages"></div>';
	
	$(xmlResp).each(function(index)
	{
		var orderId=$(this).attr('order');
		var title = $(this).attr('name');
		var imgUrl =  $(this).find('image').attr('url');
		var imgaltText =  $(this).find('image').attr('alt_text');
		if(imgUrl==undefined){
			imgUrl =  $(this).find('img').attr('url');
		}
		if(imgaltText==undefined){
			imgaltText =  $(this).find('img').attr('alt_text');
		}
		if(index==0) {
			parseResult = parseResult + '<ul class="content compatibleGallery">';
		}else if((index)%4==0 && index!=0) {
			if(!leftNavPage){/*RS June29  using only single UL*/
				parseResult = parseResult + '</ul><ul class="content compatibleGallery">';
			}
		}
		parseResult = parseResult + '<li><div class="MOD_GC_16">';
		if(imgUrl!=undefined&&imgUrl.length!=0)
		{
			parseResult = parseResult + '<a href="javascript:void(0)"><img id="'+orderId+'" src="'+imgUrl+'" alt="'+imgaltText+'" title="'+imgaltText+'"/></a>';	
		}
		if(orderId!=undefined && title!=undefined){
			if(orderId.length!=0 && title.length!=0){
				parseResult = parseResult + '<p><a class="more" id="a_'+orderId+'" href="javascript:void(0)" >'+title+'</a></p>';	
			}
				
		}
		parseResult = parseResult + '</div></li>';
		if(length-1==index) {
			parseResult = parseResult + '</ul>';
		}
	});
	parseResult = parseResult + '<div class="page_navigation pages"></div>';
	return parseResult;
	
}



/* The following method is for the styling of the accordions that have come from the
webservices- Configurator.
Generate the html
@param xmlResp Xml Response to parse.
@param className : ClassName to set in the div tag.
@param displayType Contains whether it is tab/flat/group
*/
function styleCompEquipAccordionFrmWS(xmlResp,className,type){
	var parseResult = '';
	var length = $(xmlResp).length;
		// Call for Pagination	
	parseResult = parseResult + '<span class="compatibleEquipmentPanel">';
	
	$(xmlResp).each(function(index)
	{
		var orderId=$(this).attr('order');
		var title = $(this).attr('name');
		var desc = $(this).find('attachDesc').text();
		var smURL = $(this).find('salesManualURL').text();
		var errorMsg = $(this).find('error').attr('message');
		var titleHeaderType = 'H4';
		
		

parseResult= parseResult +'<span class="keyFeatureTabContent">';
if(desc == undefined || typeof desc == "undefined" || desc == null){
		parseResult = parseResult +'<span class="CompatibleEquipmentWrapper">'+'<'+titleHeaderType+'class="learnMore">'+title+'</'+titleHeaderType+'>';		
		//parseResult = parseResult+'<span class="CompatibleEquipmentWrapper">'+'<h4 class = "learnMore">'+title+'</h4>';
		if(smURL != undefined && smURL != null && smURL!=""){
		parseResult = parseResult+'<a id="'+orderId+'" href="javascript:void(0)" class="more">'+more+'</a>';
		}
		parseResult =parseResult+'<span class="CompatibleEquipmentDescID">'+orderId+'</span></span></span>';
		}else{
		parseResult = parseResult +'<'+titleHeaderType+' class="learnMore">'+title+'</'+titleHeaderType+'>';
		if(smURL != undefined && smURL != null && smURL!=""){
		parseResult = parseResult+'<a id="'+orderId+'" href="javascript:void(0)" class="more">'+more+'</a>';
		}
		parseResult = parseResult+'<span class="CompatibleEquipmentWrapper">';
		parseResult =parseResult+'<span class="CompatibleEquipmentDesc">'+desc+'</span>';
		parseResult =parseResult+'<span class="CompatibleEquipmentDescID">'+orderId+'</span></span></span>';	
		}
		
		
		});
	parseResult = parseResult + '</span>';
	return parseResult;
	
}


/* Parse the compatible Equipment Set response xml
Generate the html
@param xmlResp Xml Response to parse.
@param className : ClassName to set in the div tag.
@param displayType Contains whether it is tab/flat/group
*/
function parseCompLightBox(xmlResp,className,type){
	var parseResult = '';
	xmlResp = xmlResponse;
	var learnMoreHeader = '';
	var learnMoreCacheArray = [];
	
	var learnMoreResult ='';
	var lmPrevOrderId = $(xmlResp).find('prev').attr('order');
	var lmNextOrderId = $(xmlResp).find('next').attr('order');
	if(lmPrevOrderId==undefined)
	{
		lmPrevOrderId = '';
	}
	if(lmNextOrderId==undefined)
	{
		lmNextOrderId = '';
	}

	lmNextPreviousLinkData(lmPrevOrderId, lmNextOrderId);
	var lightboxTitle = $(xmlResp).find('lightbox').attr('set');
	$('.modal p.title').html(lightboxTitle);
	learnMoreResult = learnMoreResult + '<div class="itemContent"><div class="item scroll on"  id="'+ cachingMap.get("orderId")+'">';
	learnMoreResult = learnMoreResult + parseLightbox($(xmlResp).find('lightbox').children()) +'</div></div>';
	learnMoreCacheArray[0] = lmPrevOrderId;
	learnMoreCacheArray[1] = lmNextOrderId;
	learnMoreCacheArray[2] = learnMoreResult;
	learnMoreCacheArray[3] = lightboxTitle;
	learnMoreCacheArray[4] = storeCompScript;
	cachingMap.set(cachingMap.get('orderId'), learnMoreCacheArray);
	return learnMoreResult;
}

function paginationEquipmentSet(length){
	var paginationString = '';
	paginationString = paginationString + '<ul class="pages">';
	for(i=0;i<length;i++)
	{
		if(i==0)
		{
			paginationString = paginationString +'<li class="enabled"><a href="javascript:void(0">'+ (i+1) +'</a> <span>|</span></li>';
		}else
		{
			paginationString = paginationString +'<li class="enabled"><a href="javascript:void(0">'+ (i+1) +'</a> <span>|</span></li>';
		}
			
	}
	paginationString = paginationString +'<li><a href="javascript:void(0)">Next</a> <img src="/common/deere-resources/img/bullet_arrow.gif" /></li></ul>';
	return paginationString;
}

function parseLightbox(xmlResp){
	
	var lmResult = '';
	var product_ctaUrl='';
	var product_ctalabel='';
	var viewOtherOption = '';
	lmResult = lmResult + '<div class="contentLightbox"> ';
	$(xmlResp).each(function(index)
	{
		var nodeName=$(this).get(0).tagName.toLowerCase();
		
		if(nodeName=="prod_info")
		{
			title = $(this).attr('title');
			altTitle = $(this).attr('alternative_title');
			var thumbNailUrl = $(this).find('thumbnail').attr('url');
			var thumbNailAltText = $(this).find('thumbnail').attr('alt_text');
			var lightbox_imageUrl = $(this).find('lightbox_image').attr('url');
			var lightbox_imageAltText = $(this).find('lightbox_image').attr('alt_text');
			product_ctaUrl = $(this).find('product_cta').attr('url');
			product_ctalabel = $(this).find('product_cta').attr('label');
			lmResult = lmResult + '<img src="'+lightbox_imageUrl +'" class="fltRight" title="' + lightbox_imageAltText + '" alt="' + lightbox_imageAltText + '" align="right" /><h4>'+title+'</h4><h5>'+altTitle+'</h5>'; 
			
		}else if(nodeName=='features_specs')
		{
			lmResult = lmResult + '<ul>'; 
			$(this).find('features').children().each(function(){
				var feature = $(this).text();
				lmResult = lmResult + '<li>' + feature + '</li>';
			});
			lmResult = lmResult + '</ul> <table style="border-collapse: collapse;">';
			$(this).find('specs').children().each(function(index){
				var specsName = $(this).attr('name');
				var specsValue = $(this).attr('value');
				if(index%2==0)
				{
					lmResult = lmResult + '<tr>	<td class="gray">'+specsName + '</td><td class="gray">'+specsValue+'</td></tr>';
				}else 
				{
					lmResult = lmResult + '<tr><td>'+specsName + '</td><td>'+specsValue+'</td></tr>';
				}
			});
			lmResult = lmResult + '</table>';
		}else if(nodeName=='price')
		{
			lmResult = lmResult + '<p>'+$(this).attr('value')+'</p></div>';
		}else if(nodeName=='buy_now')
		{
			$(this).children().each(function(){
				var nodeNam = $(this).get(0).tagName.toLowerCase();
				
				if(nodeNam=='primary_cta')
				{
					var url = $(this).attr('url');
					var label = $(this).attr('label');
					if(label.length!=0){
						lmResult = lmResult + '<a target="_blank" class="btn_primary" href="'+url+'"><span>'+label+'</span></a>';
					}
				}
				if(nodeNam == 'view_other_options')
				{	
					var label = $(this).attr('label');
					if(label!=undefined && label.length!=0){
						lmResult = 	lmResult+ '<a href="javascript:void(0)" class="other-more viewOtherOption">'+label+'</a>';
					}	
					viewOtherOption = viewOtherOption + '<div class="buying_options"><div class="popupHeader"><a href="javascript:void(0)" class="close">close</a><h5>'+label+'</h5></div>';
					$(this).children().each(function(){
						
						var nodeName = $(this).get(0).tagName.toLowerCase();
						if(nodeName=="locate_dealer"){
							
							
							var locate_dealer_label = $(this).attr('label');
							
							var buttonUrl = $(this).find('button').attr('url');
							var buttonLabel =  $(this).find('button_label').text();
							if(buttonLabel!=null){
								buttonLabel = decHTMLifEnc(buttonLabel);
							var start = buttonLabel.indexOf("<script>");
							var end = buttonLabel.indexOf("</script>") +  9;
							storeCompScript = buttonLabel.substring(start,end);
							}
						
							
							viewOtherOption = viewOtherOption + '<div class="clrfix ptag"><label>'+locate_dealer_label+':</label><span>'+ buttonLabel +'<span class="buyOptionsUrl">'+buttonUrl+'</span></span> </div>';
						}
						if(nodeName=="build_or_buy"){
							var build_or_buy_label = $(this).attr('label');
							viewOtherOption = viewOtherOption + '<p class="clrfix"><label>'+build_or_buy_label+':</label><span>';
						
							$(this).children().each(function(index){
								var buttonURl = $(this).attr('url');
								var buttonLabel = $(this).attr('label');
								viewOtherOption = viewOtherOption + '<input class="bg_btn" type="button" value="'+buttonLabel +'" /><span class="buyOptionsUrl">'+buttonURl+'</span>';
							});
							viewOtherOption = viewOtherOption + '</span> </p>';
						}
						if(nodeName=="find_retailer"){
							var find_retailer_label = $(this).attr('label');
							viewOtherOption = viewOtherOption + '<p class="clrfix lst"><label>'+find_retailer_label+':</label><span>';
							
							$(this).children().each(function(index){
								var buttonURl = $(this).attr('url');
								var buttonLabel = $(this).attr('label');
								viewOtherOption = viewOtherOption + '<input class="bg_btn" type="button" value="'+buttonLabel +'" /><span class="buyOptionsUrl">'+buttonURl+'</span>';
							});
							viewOtherOption = viewOtherOption + '</span> </p>';
						}
					});
					viewOtherOption = viewOtherOption + '</div>';
					
				}
			});
		}
	});
	if(product_ctaUrl!=undefined&&product_ctaUrl.length!=0){
		var browseUrl = window.location.href;
		var dcrLocale = getStringPart("/", 5);
		if(typeof dcrLoacle == undefined || dcrLocale == null){
			dcrLocale = attachmentSiteName;
		}
		var browseStart = browseUrl.indexOf(dcrLocale);
		var hostUrl = browseUrl.substring(0, browseStart);
		
		var productIndex = product_ctaUrl.indexOf(dcrLocale);
		product_ctaUrl = product_ctaUrl.slice(productIndex, product_ctaUrl.length);
		lmResult = lmResult + '<a class="other-more" target="_blank" href="'+hostUrl+product_ctaUrl +'">'+product_ctalabel+'</a>';	
	}
	lmResult = lmResult +  viewOtherOption;
	return lmResult;
}
/*	Handle the insertion of html into the page 
 *  @param htmlResult:HtmlResult to inserted
 *  @param type:type of display
 */
function setHtml(htmlResult,type,orderId){
	if(type == "learnMore"||type=='lightbox' || type=='compatibility_lightbox' || type=='configuratorLearnMore')
	{	if($.isArray(htmlResult))
		{
			var lmPrevData = htmlResult[0];
			var lmNextData = htmlResult[1];
			var htmlresult = htmlResult[2];
			var barTitle = htmlResult[3];
			var storeScript = "";
			if(type=='lightbox'|| type=='compatibility_lightbox'){
				storeScript = htmlResult[4];
			}
			$('div#specLayer').append('<a href="javascript:void(0)" class="close">close</a>');
			if(type!='compatibility_lightbox' && type!='lightbox' && type != "learnMore" && type != "configuratorLearnMore"){
				$('div#specLayer').append('<ul class="MOD_FO_3 paginator"></ul>');	
			}
			lmNextPreviousLinkData(lmPrevData, lmNextData);
			$('div#specLayer').css("height","");
			$('div#specLayer').css("padding-top","");
			$('#specLayer img').remove();
			$('.modal p.title').html(barTitle);
			$(htmlresult).replaceAll('.modal .itemContent');
			$('.buying_options .clrfix span').append(storeScript);
		}else
		{   $('div#specLayer').append('<a href="javascript:void(0)" class="close">close</a>');
			if(type!='compatibility_lightbox' && type!='lightbox' && type != "learnMore" && type != "configuratorLearnMore"){
				$('div#specLayer').append('<ul class="MOD_FO_3 paginator"></ul>');	
			}
			
			$('div#specLayer').css("height","");
			$('div#specLayer').css("padding-top","");
			$('#specLayer img').remove();
			$(htmlResult).replaceAll('.modal .itemContent');	
			$('.buying_options .clrfix span').append(storeCompScript);		
			
		}

		$('.modal > a.close').bind('click',function(){lightBoxModalClose_Click(this);});
		$('input.txt').bind('blur',function(){
			if(this.value=="")this.value=localeEnterZip;
		
		});
		$('input.txt').bind('focus',function(){
			if(this.value==localeEnterZip)this.value="";
		
		});
		$('.viewOtherOption').bind('click',function(){
			viewOtherOption_Click(this);
		});
		$('div.popupHeader .close').bind('click',function(){
			divPopHeaderClose_Click(this);
		});
		$('.buying_options .bg_btn').bind('click',function(){
			buyOptionBgBtn_Click(this);
		});
		$('.buying_options .btn').bind('click',function(){
			buyOptionBtn_Click(this);
		});
		if(isFirstLearnMore==false)
		{
			isFirstLearnMore =true;
		}	
		if(type=='learnMore')
		{
			$('.modal .paginator').empty();
		
			var margin = 430-7*totalLearnMoreLink;
			
			for(i=0;i<totalLearnMoreLink;i++)
			{
				if(i==0)
				{
					$('.modal .paginator').append('<li style="margin-left:'+margin+'px"><a href="javascript:void(0)">&nbsp;</a></li>');
				}else{
					$('.modal .paginator').append('<li><a href="javascript:void(0)">&nbsp;</a></li>');
				}
				
			}

			$('.modal .paginator li:nth-child('+currentLearnMore+')').children('a').addClass('on');
			$('.itemContent .item:nth-child('+currentLearnMore+')').addClass('on');

				
			if(currentLearnMore==1)
			{
				attachPrev = $('a.prev').detach();
			}
			if((currentLearnMore==totalLearnMoreLink))
			{
				attachNext = $('a.next').detach();
			}
			if(isNextPrevLink==true)
			{
				moveGifLearnMore(nextPrevObject);
			}
		}	
	}else if(type == "features")
	{
		$('div.features').html(htmlResult);
		$('div.features a.more').bind('click',function(){learnMore_Click(this);});
		$('.expand_all').bind('click',function(){expandAll_Click(this);});
		$('.collapse_all').bind('click',function(){collapseAll_Click(this);});
		$('.MOD_FO_6a h3').unbind('click').bind('click',function(){tabFeatureSpec_Click(this);});
	}else if(type == 'specifications')
	{
		currentRTable.currentTab = $('div.specifications');
		currentRTable.currentTab.html(htmlResult);

		var category=getStringPart('/',3);

		if(category!="model")
		{
			
			if(!$('.overlayBody')[0])
				$('<div class="overlayBody"></div>').appendTo('body');
			if(!$('#addRemoveModel_Spec')[0])
				$('<div id="addRemoveModel_Spec"></div>').css({left: Math.round(($('body').width()-(990))/2)+'px', top: currentRTable.currentTab.offset().top+'px'}).appendTo('body');
			$(function()
			{
				$('.chooseModels').click(function(){
					$('.overlayBody').css('width', '100%');
				});
			});
			$('#addRemoveModel_Spec','body').html($(currentRTable.currentTab.find('.addRemoveModel')[0]));
			
			currentRTable.currentTabAddRemove = $('#addRemoveModel_Spec');
			currentRTable.scrollColNum = 3;
			currentRTable.rTableArr = currentRTable.currentTab.find('.rTable');
			currentRTable.scrollTableArr = $('div:not(".fixed") table',currentRTable.rTableArr);
			paginate();
			currentRTable.thArr = $('div.fixed table tr th',currentRTable.rTableArr);
			$('.rTable .next_column').bind('click',rTableNextColumn_Click);
			$('.rTable .prev_column').bind('click',rTablePrevColumn_Click);
			$('.scroll a.close').bind('click',scrollClose_Click);
			$('#addRemoveModel_Spec .addRemoveModel .apply').bind('click',addRemoveModelApply_Click);
			$('.itemModel .showAll').bind('click',function(){showAll_Click(this);});
			$('.rTable .tablepag span').delegate('a','click',rTableSpanA_Click);
			$('.chooseModels').bind('click',chosseModels_Click);
			$('#addRemoveModel_Spec .addRemoveModel a').bind('click',function(){addRemoveModelA_Click(this);});
			$('.MOD_FO_6b h3').bind('click',function(){tabFeatureSpec_Click(this);});
			$('.expand_all').bind('click',function(){expandAllSpecSeries_Click(this);});
			$('.collapse_all').bind('click',function(){collapseAllSpecSeries_Click(this);});
		}else
		{
			$('.MOD_FO_6a h3').unbind('click').bind('click',function(){tabFeatureSpec_Click(this);});
			$('.expand_all').bind('click',function(){expandAll_Click(this);});
			$('.collapse_all').bind('click',function(){collapseAll_Click(this);});
		}

		
		
	}else if(type == 'compatible') {
		
		$('div.compatible').html(htmlResult);	
		$('.MOD_FO_6d h3').bind('click',function(){openCompEquipmentAccordion_Click(this);});
		$('.MOD_FO_6d h3').bind('click',function(){compatibleEquipment_Click(this);});
		//Sudha for the configurator for artf1295955
		$('div.compatible span.compatibleEquipmentPanel a.more').die('click').live('click',function(){configurator_More_Click(this);});
		
	}else if(type=="compare"){
		
		$('div.compare').html(htmlResult);
		$('div.compare a.compareModels').bind('click',function(){compare_Click(this);});
		$('#checkAllAutoLeft').bind('click',function(){checkAllAutoLeft(this);});
		$('#checkAllAutoRight').bind('click',function(){checkAllAutoRight(this);});
		$('.listCompare li input, .listCompare2 li input, .topCompare input').bind('click',function(){enableCompare(this,orderId);});
		
		$('.print_preview .listCompare2 li input:lt(2)').attr("checked", "checked");		
		$('.print_preview .print_tab.compare .header a').removeClass("noCompareModels").addClass("compareModels");
		if($(".print_preview .printing_selection .selection_options li.tab_compare input").is(':checked')) {
			if(!$('.print_preview .print_tab.compare .MOD_FO_6b').length) {compare_Click($('.print_preview .print_tab.compare .header a'),"");}
		}			

	} else if(type=="compareSpec"){
		modelsToExport = '';
		currentRTable.currentTab = $('div.compare');
		var loaderGifFlag = currentRTable.currentTab.find('img[src$="/common/deere-resources/img/loading.gif"]');
		if(loaderGifFlag.length==1) {
			currentRTable.currentTab.append(htmlResult).end().find('.MOD_FO_6b').css('display','none');
		} else {
			currentRTable.currentTab.html(htmlResult);
		}
		if(!$('.overlayBody')[0])
				$('<div class="overlayBody"></div>').appendTo('body');
		if(!$('#addRemoveModel_Comp')[0])
			$('<div id="addRemoveModel_Comp"></div>').css({left: Math.round(($('body').width()-(990))/2)+'px', top: currentRTable.currentTab.offset().top+'px'}).appendTo('body');
		$(function()
			{
				$('.chooseModels').click(function(){
					$('.overlayBody').css('width', '100%');
				});
			});
		
		
		$('#addRemoveModel_Comp','body').html($(currentRTable.currentTab.find('.addRemoveModel')[0]));
			
		currentRTable.currentTabAddRemove = $('#addRemoveModel_Comp');
		currentRTable.scrollColNum = 2;
		currentRTable.rTableArr = currentRTable.currentTab.find('.rTable');
		currentRTable.scrollTableArr = $('div:not(".fixed") table',currentRTable.rTableArr);
		if(compareModalsArr.length>1) {
			$(currentRTable.scrollTableArr.find('thead')[0]).find('tr th').each(function(index) {
				if(index>1) {
					var modelName = $.trim($(this).find('span.modelName').text());
					var manufacturerName = $.trim($(this).find('span.manufacturerName').text());
					var regexTerm = manufacturerName+modelName;
					var currentClass = $(this).attr('class');
					var currentClassLast = currentClass.split(" ")[1];
					var start = currentClass.lastIndexOf("_")+1;
					var end = currentClass.length;
					var tempModelsToExport = currentClass.substring(start,end);
					allModelsToExport += tempModelsToExport + ',';
					if(!compareModalsArr.match(eval('/,'+RegExp.escape(regexTerm)+',/gi'))) {
						/*DD artf1288127*/
						$('tr th.'+currentClassLast+'',currentRTable.scrollTableArr).css('display','none');
						$('tr td.'+currentClassLast+'',currentRTable.scrollTableArr).css('display','none');

						showModels.remove((showModels.valArray.indexOf(currentClass))+1);
					}else{
						modelsToExport += tempModelsToExport + ',';
					}
				}
			});
			adjustDots();
			showhide(0);
			adjustAddRemove(0);
			compareModalsArr = ',';
		}
		paginate();
		if(loaderGifFlag.length==1) {
			currentRTable.currentTab.find('img[src$="/common/deere-resources/img/loading.gif"]').remove().end().find('.MOD_FO_6b').css('display','block');
		}
		currentRTable.thArr = $('div.fixed table tr th',currentRTable.rTableArr);
		$('.rTable .next_column').bind('click',rTableNextColumn_Click);
		$('.rTable .prev_column').bind('click',rTablePrevColumn_Click);
		$('.scroll a.close').bind('click',scrollClose_Click);
		$('#addRemoveModel_Comp .addRemoveModel .apply').bind('click',addRemoveModelApply_Click);
		$('.itemModel .showAll').bind('click',function(){showAll_Click(this);});
		$('.rTable .tablepag span').delegate('a','click',rTableSpanA_Click);
		$('.chooseModels').bind('click',chosseModels_Click);
		$('#addRemoveModel_Comp .addRemoveModel a').bind('click',function(){addRemoveModelA_Click(this);});
		$('.MOD_FO_6b h3').bind('click',function(){tabFeatureSpec_Click(this);});
		$('.expand_all').bind('click',function(){expandAllSpecSeries_Click(this);});
		$('.collapse_all').bind('click',function(){collapseAllSpecSeries_Click(this);});
		$('.compare .MOD_FO_6b p a.xls').bind('click',function(){exportComparisonClick(this,modelsToExport);});
	}
	if(type =='compatibleEquipmentSet')
	{	id = "DIV#tab_"+orderId;
		$(id).html(htmlResult);
		$(id).pajinate({
			num_page_links_to_display : 3,
			items_per_page : 8	
		});
		$('.compatibleGallery a.more,.compatibleGallery img ').bind('click',function(){compatibleProductThumbnail_Click(this);});
	}
	$('div.rTable table tr.sub_attribute_row1, div.rTable table tr.sub_attribute_row').addClass('first_tr').prev('tr').addClass('first_tr');/*RS multiple specification value QC 343 */
}

/* Handle the moving of dots in lightbox when clicked on next and prev link.
 * @param Contains Whether next link is clicked or previous
 */
function moveGifLearnMore(param){

	obj = $(param).attr('class');

	var ttl = totalLearnMoreLink;
	var ind = 0;

	switch(obj) {
	case "prev":
		active =currentLearnMore;
		var tempactive1;
		var tempactive2;
		if (active == 1) 
		{	
			tempactive1 = active;
			tempactive2 = active-1;
			$('.modal .paginator li').eq(tempactive1).find('a').removeClass('on');
			$('.modal .paginator li').eq(tempactive2).find('a').addClass('on');
			attachPrev = $('a.prev').detach();
		} else if(active==ttl-1) 
		{
			tempactive1 = active;
			tempactive2 = active-1;
			$('.modal .paginator li').eq(tempactive1).find('a').removeClass('on');
			$('.modal .paginator li').eq(tempactive2).find('a').addClass('on');
			attachNext.appendTo('.modal');
		}else if(active>1&&active<ttl)
		{
			tempactive1 = active;
			tempactive2 = active-1;
			$('.modal .paginator li').eq(tempactive1).find('a').removeClass('on');
			$('.modal .paginator li').eq(tempactive2).find('a').addClass('on');
		}

		currentLearnMore = active-1;

		break;
	case "next":
		active = currentLearnMore;
		var tempactive1;
		var tempactive2;
		if (active == ttl) 
		{
			tempactive1 = active-2;
			tempactive2 = active-1;
			$('.modal .paginator li').eq(tempactive1).find('a').removeClass('on');
			$('.modal .paginator li').eq(tempactive2).find('a').addClass('on');
			attachNext =$('a.next').detach();
		} else if(active==1)
		{	
			tempactive1 = active-1;
	     	tempactive2 = active;
			$('.modal .paginator li').eq(tempactive1).find('a').removeClass('on');
			$('.modal .paginator li').eq(tempactive2).find('a').addClass('on');
			attachPrev.appendTo('.modal');
		}else if (active>1&& active<ttl)
		{
			tempactive1 = active-2;
	     	tempactive2 = active-1;
			$('.modal .paginator li').eq(tempactive1).find('a').removeClass('on');
			$('.modal .paginator li').eq(tempactive2).find('a').addClass('on');
		}
		
		currentLearnMore = active+1;
		break;
	}
}
// HashMap function for caching the response data.
function HashMap()
{
	// members
	this.keyArray = new Array(); // Keys
	this.valArray = new Array(); // Values
}

// Adding the HashMap function in Javascript library
HashMap.prototype.set = function(key, val){
	var elementIndex = this.findIt( key );

	if( elementIndex == (-1) )
	{
		this.keyArray.push( key );
		this.valArray.push( val );
	}
	else
	{
		this.valArray[ elementIndex ] = val;
	}
};

// HashMap get Method
HashMap.prototype.get = function( key ){
	var result = null;
	var elementIndex = this.findIt( key );

	if( elementIndex != (-1) )
	{
		result = this.valArray[ elementIndex ];
	}

	return result;
};

// Method to remove the data from the HashMap with the specific key
HashMap.prototype.remove = function ( key )
{
	var result = null;
	var elementIndex = this.findIt( key );

	if( elementIndex != (-1) )
	{
		var part1 = this.keyArray.slice( 0, elementIndex);
		var part2 = this.keyArray.slice( elementIndex+1 );
		this.keyArray = part1.concat( part2 );
		
		for(var g=0;g<this.keyArray.length;g++ ){
			this.keyArray[g]=g+1;
		}
		var val1 = this.valArray.slice( 0, elementIndex);
		var val2 = this.valArray.slice( elementIndex+1 );
		this.valArray = val1.concat( val2 );
		
	}
	return;
};

// Gives the size of the HashMap
HashMap.prototype.size = function()
{
	return (this.keyArray.length);
};

// Clears the HashMap
HashMap.prototype.clear = function()
{
	var arrSize = this.keyArray.length;
	for( var cnt = 0; cnt <arrSize ; cnt++ )
	{
		this.keyArray.pop(); 
		this.valArray.pop();
	}
};
HashMap.prototype.findIt = function( key )
{
	var result = (-1);

	for( var i = 0; i < this.keyArray.length; i++ )
	{
		if( this.keyArray[ i ] == key )
		{
			result = i;
			break;
		}
	}
	return result;
};

HashMap.prototype.removeAt = function( index )
{
	
	var part1 = this.slice( 0, index);
	var part2 = this.slice( index+1 );

	return( part1.concat( part2 ) );
};

// Decode  a String to convert it into HTML DOM.
function decHTMLifEnc(str){
    if(isEncHTML(str))
      return str.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
    return str;
}

// Check whether string is encoded with HTML DOM or not.
function isEncHTML(str) {
  if(str.search(/&amp;/g) != -1 || str.search(/&lt;/g) != -1 || str.search(/&gt;/g) != -1)
    return true;
  else
    return false;
};
/**
 * Function to paginate for series specification tab
 */
function paginate() {
	currentRTable.rTableArr.attr('style','position: relative;');
	$(currentRTable.rTableArr[0]).show();

	$('.tablepag .prev_column, .tablepag .next_column',currentRTable.rTableArr).hide();
	
	var ttl_columns = showModels.size();	
	if (ttl_columns > 3) {
		$('.tablepag .next_column',currentRTable.rTableArr).show();
	}

	currentRTable.scrollTableArr.width(tableWidth+(tableWidth*ttl_columns));
	
	$('table',currentRTable.rTableArr).each(function() {
		$(this).parent().before('<div class="fixed tablediv1"></div>');
		$(this).clone().appendTo($($(this).parents('.rTable')[0]).find('.fixed')[0]);
	});
	$('.fixed th:first',currentRTable.rTableArr).attr('style','width:'+ colWidth +' !important');
	
	currentRTable.scrollTableArr.css({position: 'relative'});
}
/**
 * Event called on the click of next_column click for pagination
 */
function rTableNextColumn_Click() {
	if(currentRTable.scrollTableArr.is(':animated'))
	return false;
	var scrollTableVisibleArr = $('div:not(".fixed") table:visible',currentRTable.rTableArr), scrollWidth, ctr = 0, position = scrollTableVisibleArr.position(), oneColumnWidth = $(currentRTable.thArr.filter(':visible')[0]).outerWidth();
	if(!leftNavPage){/*RS June29 to maintain the previous button at left*/
		if(currentRTable.scrollColNum===2) {
			$('.tablepag .prev_column',currentRTable.rTableArr).css({
				'left':oneColumnWidth*2-165+'px'
			});
		}
	}
	if(leftNavPage){
		currentRTable.scrollColNum = 2;
	}
	$('.tablepag span a',currentRTable.rTableArr).removeClass('on');
    
    current = 0;
	scrollWidth = oneColumnWidth*currentRTable.scrollColNum;
    currentRTable.scrollTableArr.animate({left: position.left - scrollWidth}, 300, function() {
		var f = scrollTableVisibleArr.position();
		ctr++;
		current = Math.round((f.left * -1) / (scrollWidth-5)); //
		if(ctr===1) {
			currentRTable.rTableArr.find('.p'+current).addClass('on');
			showhide(current);
			adjustAddRemove(current);
			currDot=current;
		}
	});

}


/**
 * Event called on the click of prev_column click for pagination
 */
 function rTablePrevColumn_Click(){
	if(currentRTable.scrollTableArr.is(':animated'))
	return false;
	var scrollTableVisibleArr = $('div:not(".fixed") table:visible',currentRTable.rTableArr), scrollWidth, ctr = 0, position = scrollTableVisibleArr.position(), oneColumnWidth = $(currentRTable.thArr.filter(':visible')[0]).outerWidth();
		
	$('.tablepag span a',currentRTable.rTableArr).removeClass('on');
	scrollWidth = oneColumnWidth*currentRTable.scrollColNum;
    currentRTable.scrollTableArr.animate({left: position.left + scrollWidth}, 300, function() {
		var f = scrollTableVisibleArr.position();
		ctr++;
		current = Math.round((f.left * -1) / (scrollWidth-5));
		if(ctr===1) {
			currentRTable.rTableArr.find('.p'+current).addClass('on');
			showhide(current);
			adjustAddRemove(current);
			currDot=current;
		}
	});
	
}

/**
 * Function to adjust the number of models getting displayed on the page
 * @param page The current page number
 */
function adjustAddRemove(page){
	if(page==-1)page=0;
	var modelNum='';
	
	var showModelSize = showModels.size();
	if(showModelSize==0){
		modelNum = '0 ' + modelsDisplayed;
	}else if(currentRTable.scrollColNum===2 || leftNavPage){
		if(leftNavPage){/*RS June29 new pagination is introduced since i found old one bit fuzzy please introspect once*/
			
			
			var _currentPage = parseInt(page+1) * 2,
			_currentPageLast = (_currentPage >= showModelSize) ? showModelSize : _currentPage,
			modelNum = (_currentPage-1)+' - '+ (_currentPageLast) +' of '+ showModelSize +' ' + modelsDisplayed;
		
		}else{
			if(showModelSize > (2*page+2)){
				if(page==0){
					modelNum = (2*page+1)+ ' - '+ (2*page+3) + ' of ' + showModelSize +' ' + modelsDisplayed;
				}else{
					modelNum = (2*page+2)+ ' - '+ (2*page+3) + ' of ' + showModelSize +' ' + modelsDisplayed;
				}
				
			}else{
				if(showModelSize==(2*page+2)){
					if(showModelSize==2){
						modelNum = (showModelSize-1)+ ' - '+ showModelSize + ' of ' + showModelSize+' ' + modelsDisplayed;
					}else{
						modelNum = showModelSize+ ' - '+ showModelSize + ' of ' + showModelSize+' ' + modelsDisplayed;	
					}
					
				}else if(showModelSize==1){
					modelNum = showModelSize+ ' - '+ showModelSize + ' of ' + showModelSize+' ' + modelsDisplayed;
				}else{
					modelNum = showModelSize+ ' - '+ (showModelSize+1) + ' of ' +showModelSize+' ' + modelsDisplayed;	
				}
				
			}
		}
	}else if(currentRTable.scrollColNum===3){
		if(showModelSize > (3*page+3)){
			modelNum = (3*page+1)+ ' - '+ (3*page+3) + ' of ' + showModelSize +' ' + modelsDisplayed;
			}
			else{
				modelNum = (3*page+1)+ ' - '+ showModelSize + ' of ' + showModelSize +' ' + modelsDisplayed;
			}
	}
	modelNum = modelNum + ' <a class="showAll" href="javascript:void(0)">'+showAllModels+'</a> <span class="pipe">|</span> <a href="javascript:void(0)" class="chooseModels">'+AddRemoveModels+'</a>';
	$('p.itemModel').html(modelNum);
	$('.chooseModels').bind('click',chosseModels_Click);
	$('.itemModel .showAll').bind('click',function(){showAll_Click(this);});

}

/**
 * @param pos
 */
function showhide(pos) {
	var totalLen = $(currentRTable.rTableArr[0]).find('span.tablepag span a').length;
	if(totalLen==1)totalLen=0;
	$('.prev_column, .next_column',currentRTable.rTableArr).show();
	if(totalLen==0) {
		$('.prev_column, .next_column',currentRTable.rTableArr).hide();
	}
	if (pos == 0) {
		$('.prev_column',currentRTable.rTableArr).hide();
	}
	if (pos == totalLen-1) {
		$('.next_column',currentRTable.rTableArr).hide();
	}
}

/**
 * Close the selected model on click of cross
 */
   function scrollClose_Click(){
    	var postn;
        var cur_class = $($(this).parents('th')[0]).attr('class');
        var close_col = cur_class.substr(cur_class.lastIndexOf('_')+1,cur_class.length-1);
        $('div table',currentRTable.rTableArr).find('th.td_col_'+close_col).css('display','none');		
		$('div table',currentRTable.rTableArr).find('td.td_col_'+close_col).css('display','none');
		
		
        for(var p=0;p<showModels.valArray.length;p++){
			if(showModels.valArray[p]==cur_class){
				postn=p;
			}
        }
        showModels.remove(postn+1);
		var showModalSize = showModels.size();
		if (showModalSize % currentRTable.scrollColNum == 0) {
			ttl_page = showModalSize / currentRTable.scrollColNum;
		} else {
			ttl_page = parseInt(showModalSize / currentRTable.scrollColNum) + 1;
		}
        $('div.fixed table, div.scroll table',currentRTable.rTableArr).width(tableWidth+(tableWidth*showModalSize));
      
		adjustDots();
		if(showModalSize<=(currentRTable.scrollColNum*(currDot+1))){
			if(currDot==ttl_page && ttl_page!=0) {
				rTablePrevColumn_Click();
			}
			currDot=ttl_page-1;
		}
		showhide(currDot);
    	adjustAddRemove(currDot);
    }
/**
 * Add remove the selected models
 */
  function addRemoveModelApply_Click(){
		var uncheckedCount=1;
    	var checkedCount=1;
		var dontShowModelsArr = [];
		var showShowModelsArr = [];
    	showModels.clear();
		
    	$(".addRemoveModel input:checkbox",currentRTable.currentTabAddRemove).each(function(){
    	if(!$(this).attr('checked')){
				var currId = $(this).attr('id');
				var modalStr = currId+' td_col_'+currId.substr(currId.lastIndexOf('_')+1,currId.length-1);
				dontShowModelsArr[uncheckedCount-1] = 'td_col_'+currId.substr(currId.lastIndexOf('_')+1,currId.length-1);
				uncheckedCount++;
			}
			else{
				var currId = $(this).attr('id');
				var modalStr = currId+' td_col_'+currId.substr(currId.lastIndexOf('_')+1,currId.length-1);
				showModels.set(checkedCount,modalStr);
				checkedCount++;
			}
		});
		var showModelsSize = showModels.size();
    	$('div table',currentRTable.rTableArr).width(tableWidth+(tableWidth*showModelsSize));
		if(currDot==-1)
		currDot=0;
		
    	hideUnhideModels(showModels,dontShowModelsArr);
    	setModelsToExport(showModels);
		
		if(showModelsSize!=model_namesCache.get(currentRTable.currentTabBaseCode).size()){
			adjustDots();
			adjustAddRemove(currDot);
			showhide(currDot);
		}
		$('.overlayBody').hide();
		currentRTable.currentTabAddRemove.hide();
		if(currentRTable.scrollColNum==2)
			checkedCount = checkedCount-2;
		else
			checkedCount = checkedCount-1;
		
		if(checkedCount<=currentRTable.scrollColNum) {
			var index = 0;
		} else if(checkedCount % currentRTable.scrollColNum==0) {
			var index = Math.floor(checkedCount/currentRTable.scrollColNum) - 1;
		} else {
			var index = Math.floor(checkedCount/currentRTable.scrollColNum);
		}
		
		if(index<currDot) {
			animateToIndex(index);
			currDot = index;
			$('span.tablepag span a[rel='+index+']', currentRTable.rTableArr).addClass('on');
			if(index==0) {
				$('.prev_column, .next_column',currentRTable.rTableArr).hide();
			} else {
				$('.next_column',currentRTable.rTableArr).hide();
			}
		} else if(currDot==index) {
			$('.next_column',currentRTable.rTableArr).hide();
		}
    }
    
    function adjustDots(){
    	
    	var putDots='';
		
		var table = '';
		var modelSizeCal = '';
		var modelSize = showModels.size();
		/*RS*/
		if(currentRTable.scrollColNum==2 && !leftNavPage){
			modelSize = modelSize -1;
		}
		if(leftNavPage){
			currentRTable.scrollColNum = 2;
		}
		if (modelSize % currentRTable.scrollColNum == 0) {
			ttl_page = modelSize / currentRTable.scrollColNum;
		} else {
			ttl_page = parseInt(modelSize / currentRTable.scrollColNum) + 1;
		}
    
    	for(var k=0;k<ttl_page;k++){
			if (k==currDot) {
				putDots = putDots +'<a href="javascript:void(0)" rel='+k+' class="p'+k+' on">' + (k + 1) + '</a>';
			} else {
				putDots = putDots +'<a href="javascript:void(0)" rel='+k+' class="p'+k+'">' + (k + 1) + '</a>';
			}
		}
    	$('.tablepag span',currentRTable.rTableArr).html(putDots);
    }
    /**
     * Function to hide the models passed in the Map
     * @param dontShowModels Map containing all the model classes to be hidden
     */
    function hideUnhideModels(showModels,dontShowModels){
		var showModelsSize = showModels.size();
		var seriesHTML='';
		if(showModelsSize==model_namesCache.get(currentRTable.currentTabBaseCode).size()){
			if(currentRTable.scrollColNum===2){
				seriesHTML = cachingMap.get(baseCodeCompareSpecs+'compareSpec');
				setHtml(seriesHTML, 'compareSpec',baseCodeCompareSpecs);
			}else if(currentRTable.scrollColNum===3){
				if(basecode==null){
					seriesHTML = cachingMap.get('specifications');
				}else{
					seriesHTML = cachingMap.get(basecode);
				}
				setHtml(seriesHTML, 'specifications');
			}
		} else {
			for(var i=0, scrollTableArrLen = currentRTable.rTableArr.length;i<scrollTableArrLen;i++) {
				var currentTableCells = currentRTable.rTableArr[i].getElementsByTagName('td');
				var currentTableHeads = currentRTable.rTableArr[i].getElementsByTagName('th');
				for(j=0, currentTableCellsLen = currentTableCells.length;j<currentTableCellsLen;j++) {
					var cur_class = $(currentTableCells[j]).attr('class');
					var close_col = cur_class.substr(cur_class.lastIndexOf('_')+1,cur_class.length-1);
					if(dontShowModels.indexOf('td_col_'+close_col)!=-1) {
						currentTableCells[j].style.display = 'none';
					} else if(dontShowModels.indexOf('td_col_'+close_col)==-1 && currentTableCells[j].style.display.toLowerCase() == 'none') {
						currentTableCells[j].style.display = '';
					}
				}
				
				for(k=0, currentTableHeadsLen = currentTableHeads.length;k<currentTableHeadsLen;k++) {
					var cur_class1 = $(currentTableHeads[k]).attr('class');
					var close_col1 = cur_class1.substr(cur_class1.lastIndexOf('_')+1,cur_class1.length-1);
					if(dontShowModels.indexOf('td_col_'+close_col1)!=-1) {
						currentTableHeads[k].style.display = 'none';
					} else if(dontShowModels.indexOf('td_col_'+close_col1)==-1 && currentTableHeads[k].style.display.toLowerCase() == 'none') {
						currentTableHeads[k].style.display = '';
					}
				}
			}
		}
    }
    /**
     * Function to show the models passed in the Map
     * @param showModels Map containing all the model classes to be shown
     */
    function setModelsToExport(showModels){
		var showModelsSize = showModels.size();
		modelsToExport = '';
		for(var i= 1;i<=showModelsSize;i++){
			var cur_class = showModels.get(i);

			var start = cur_class.lastIndexOf("_")+1;
			var end = cur_class.length;
			var tempModelsToExport = cur_class.substring(start,end);
			modelsToExport += tempModelsToExport + ',';
		}
    }
    /**
     * show all models on the series specification page
     */
  function showAll_Click($this) {
    	showModels.clear();
		for(var valArr =1; valArr <= model_namesCache.get(currentRTable.currentTabBaseCode).keyArray.length;valArr++){
    		showModels.keyArray.push(valArr);
    		showModels.valArray.push(("td_1_"+valArr+" td_col_"+valArr));
    	}
		var seriesHTML='';
		/*RS*/
		if(currentRTable.scrollColNum===3 || leftNavPage){
			if(basecode==null){
				seriesHTML = cachingMap.get('specifications');
			}else{
				seriesHTML = cachingMap.get(basecode);
			}
			setHtml(seriesHTML, 'specifications');
		}else if(currentRTable.scrollColNum===2){
			seriesHTML = cachingMap.get(baseCodeCompareSpecs+'compareSpec');
			setHtml(seriesHTML, 'compareSpec',baseCodeCompareSpecs);
		} 
		
    	if (showModels.size() % 3 == 0) {
    		ttl_page = showModels.size() / 3;
		} else {
			ttl_page = parseInt(showModels.size() / 3) + 1;
		}
    	currDot=0;
    }
    
	function rTableSpanA_Click(){
		var index = parseInt($(this).attr('rel'));
		
		$('.tablepag span a',currentRTable.rTableArr).removeClass('on');
		$('.p'+index,currentRTable.rTableArr).addClass('on');
		currDot = index;
		paging_columns(index);
	}
	
	function paging_columns(index) {
		var scrollWidth, ctr=0;
		/*RS*/
		if(leftNavPage){
			currentRTable.scrollColNum = 2;
		}
		scrollWidth = tableWidth*currentRTable.scrollColNum;
		currentRTable.scrollTableArr.animate({left: -(scrollWidth)*index}, 'fast', function() {
			if(ctr==0) {
				adjustAddRemove(index);
				showhide(index);
			}
			ctr++;
		});
	}
    
	function chosseModels_Click(){
		var pos = currentRTable.currentTab.offset();
		//var chooseModalHeight = $('.addRemoveModel',currentRTable.currentTabAddRemove).outerHeight();
		var checkBoxArr = $('.addRemoveModel input:checkbox',currentRTable.currentTabAddRemove);
		//var visibleColumns = $('thead:first tr:first th:not(:first):visible',currentRTable.scrollTableArr.filter(':visible'));
		//var postab = $('.tabContent').parent().offset();
		
		if(currentRTable.scrollColNum==2)
			$('.addRemoveModel input',currentRTable.currentTabAddRemove).not(0).attr('checked',false).end().eq(0).attr({'checked':true, 'disabled':'disabled'});
		else
			$('.addRemoveModel input',currentRTable.currentTabAddRemove).attr('checked',false);
		
		if(showModels.size()>0) {
			$.each(showModels.valArray,function(index,value) {
				checkBoxArr.filter('#'+value.split(' ')[0]).attr('checked',true);
			});
		}
		var chooseModelsLinkArr = $('.chooseModels',currentRTable.currentTab);
		var bodyElem = $('.overlayBody','body');
		bodyElem.fadeIn();
		if($.inArray(this,chooseModelsLinkArr)==0) {
			currentRTable.currentTabAddRemove.css({
				//'left': pos.left-(postab.left+20)+'px',
				'top': pos.top+'px'
			}).show(function() {
				bodyElem.css({height: $(document).height()+'px'});
			});
		} else {
			currentRTable.currentTabAddRemove.css({
				//'left': pos.left-(postab.left+20)+'px',
				'top': pos.top+'px'
			}).show(function() {$('html,body').animate({
						scrollTop: pos.top-20
					}, 'fast');
					bodyElem.css({height: $(document).height()+'px'});
			});
			
		}
	}
	function addRemoveModelA_Click($this) {
		$('.overlayBody').hide();
		currentRTable.currentTabAddRemove.hide();
	}
	
	function animateToIndex(index) {
		var scrollWidth, oneColumnWidth = $(currentRTable.thArr.filter(':visible')[0]).outerWidth();
		
		scrollWidth = oneColumnWidth*currentRTable.scrollColNum;
		currentRTable.scrollTableArr.animate({left: -(scrollWidth)*index}, 300);
		
		adjustAddRemove(index);
	}

	/* http://keith-wood.name/localisation.html
   Localisation assistance for jQuery v1.0.5.
   Written by Keith Wood (kbwood{at}iinet.com.au) June 2007. 
   Dual licensed under the GPL (http://dev.jquery.com/browser/trunk/jquery/GPL-LICENSE.txt) and 
   MIT (http://dev.jquery.com/browser/trunk/jquery/MIT-LICENSE.txt) licenses. 
   Please attribute the author if you use it. */

(function($) { // Hide scope, no $ conflict

/* Load applicable localisation package(s) for one or more jQuery packages.
   Assumes that the localisations are named <base>-<lang>.js
   and loads them in order from least to most specific.
   For example, $.localise('mypackage');
   with the browser set to 'en-US' would attempt to load
   mypackage-en.js and mypackage-en-US.js.
   Also accepts an array of package names to process.
   Optionally specify whether or not to include the base file,
   the desired language, and/or the timeout period, e.g.
   $.localise(['mypackage1', 'yourpackage'], 
      {loadBase: true; language: 'en-AU', timeout: 300});
   @param  packages  (string or string[]) names of package(s) to load
   @param  settings  omit for the current browser language or
                     (string) code for the language to load (aa[-AA]) or
                     (object} options for the call with
					   language  (string) the code for the language
					   loadBase  (boolean) true to also load the base package or false (default) to not
                       path      (string or string[2]) the paths to the JavaScript,
                                 either as both or [base, localisations]
					   timeout   (number) the time period in milliseconds (default 500)
   @param  loadBase  (boolean, optional) true to also load the base package or false (default) to not -
                     omit this if settings is an object
   @param  path      (string or string[2], optional) the paths to the JavaScript,
                     either as both or [base, localisations] -
                     omit this if settings is an object
   @param  timeout   (number, optional) the time period in milliseconds (default 500) -
                     omit this if settings is an object */
	$.localise = function(packages, settings, loadBase, path, timeout) {
		if (typeof settings != 'object' && typeof settings != 'string') {
			timeout = path;
			path = loadBase;
			loadBase = settings;
			settings = '';
		}
		if (typeof loadBase != 'boolean') {
			timeout = path;
			path = loadBase;
			loadBase = false;
		}
		if (typeof path != 'string' && !$.isArray(path)) {
			timeout = path;
			path = ['', ''];
		}
		settings = (typeof settings != 'string' ? settings || {} :
		{language: settings, loadBase: loadBase, path: path, timeout: timeout});
		var paths = (!settings.path ? ['', ''] :
			($.isArray(settings.path) ? settings.path : [settings.path, settings.path]));
		var opts = {async: false, dataType: 'script',
				timeout: (settings.timeout != null ? settings.timeout : 500)};
		var localiseOne = function(package, lang) {
			if (settings.loadBase) {
				$.ajax($.extend(opts, {url: paths[0] + package + '.js'}));
			}
			if (lang.length >= 2) {
				$.ajax($.extend(opts, {url: paths[1] + package + '_' + lang.substring(0, 2) + '.js'}));
			}
			if (lang.length >= 5) {
				$.ajax($.extend(opts, {url: paths[1] + package + '_' + lang.substring(0, 5) + '.js'}));
			}
		};
		var lang = normaliseLang(settings.language || $.localise.defaultLanguage);
		packages = ($.isArray(packages) ? packages : [packages]);
		for (i = 0; i < packages.length; i++) {
			localiseOne(packages[i], lang);
		}
	};

// Localise it!
$.localize = $.localise;

/* Retrieve the default language set for the browser. */
$.localise.defaultLanguage = normaliseLang(navigator.language /* Mozilla */ ||
	navigator.userLanguage /* IE */);

/* Ensure language code is in the format aa-AA. */
function normaliseLang(lang) {
	lang = lang.replace(/_/, '_').toLowerCase();
	if (lang.length > 3) {
		lang = lang.substring(0, 3) + lang.substring(3).toUpperCase();
	}
	return lang;
}

})(jQuery);

// Added code to provide support for indexOf for Arrays in IE
if(!Array.indexOf){
  Array.prototype.indexOf = function(obj){
   for(var i=0; i<this.length; i++){
    if(this[i]==obj){
     return i;
    }
   }
   return -1;
  }
}
RegExp.escape = function(str) {
	var specials = new RegExp("[.*+?|()\\[\\]{}\\\\\/]", "g"); // .*+?|()[]{}\
	return str.replace(specials, "\\$&");
}
/************* Function to construct the page URL ********************/
function constructPageLink(url){
	var tempUrl = url;
	if(url.indexOf('/sites')==0&&url.lastIndexOf('.page')==url.length-5){
		var locale = url.split('/')[2];
		tempUrl = window.location.href.substr(0,window.location.href.indexOf(locale))+url.substring(url.indexOf(locale));		
	}
	return tempUrl;
}