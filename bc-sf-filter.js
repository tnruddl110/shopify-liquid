
var onSale = false;
var soldOut = false;
var priceVaries = false;
var images = [];
var firstVariant = {};
// Override Settings
var bcSfFilterSettings = {
    general: {
        limit: bcSfFilterConfig.custom.products_per_page,
        /* Optional */
        loadProductFirst: true
    }
};

var faveIcon = `<div class="ssw-faveiticon sswfaveicon{{itemId}}">
      <i data-product-id="{{itemId}}" data-count="0" class="ssw-icon-heart-o ssw-fave-icon ssw-wishlist-element ssw-not-synch" 
         data-params='{"product_id":"{{itemId}}","event":"fave_button","page":"product_profile"}'></i>
      <span class="faves-count">...</span>
    </div>`;

// Declare Templates
var bcSfFilterTemplate = {
    // Grid Template
    'productGridItemHtml': '<div class="Grid__Cell 1/'+ bcSfFilterConfig.custom.mobile_row + '--phone 1/' + bcSfFilterConfig.custom.tablet_row + '--tablet-and-up 1/' + bcSfFilterConfig.custom.desktop_row + '--' + buildClass() +'">'+
                            '<div class="ProductItem '+ buildClassHiz() + '" style="visibility: inherit; opacity: 1; transform: matrix(1, 0, 0, 1, 0, 0);">'+ faveIcon +
                              '<div class="ProductItem__Wrapper">'+
                                '{{itemImages}}' +
                                '{{itemLabels}}'+
                                '{{itemInfo}}'+
                              '</div>'+
                              buildButtonSecond() +
                             '</div>'+
                            '</div>',

    // Pagination Template
    'previousActiveHtml': '<a class="Pagination__NavItem Link Link--primary" rel="prev" href="{{itemUrl}}"><svg class="{{ icon_class }}" role="presentation" viewBox="0 0 11 18"><path d="M9.5 1.5L1.5 9l8 7.5" stroke-width="2" stroke="currentColor" fill="none" fill-rule="evenodd" stroke-linecap="square"></path></svg></a>',
    'previousDisabledHtml': '',
    'nextActiveHtml': '<a class="Pagination__NavItem Link Link--primary" rel="next" href="{{itemUrl}}"><svg class="{{ icon_class }}" role="presentation" viewBox="0 0 11 18"><path d="M1.5 1.5l8 7.5-8 7.5" stroke-width="2" stroke="currentColor" fill="none" fill-rule="evenodd" stroke-linecap="square"></path> </svg></a>',
    'nextDisabledHtml': '',
    'pageItemHtml': '<a class="Pagination__NavItem Link Link--primary" href="{{itemUrl}}">{{itemTitle}}</a>',
    'pageItemSelectedHtml': '<span class="Pagination__NavItem buildPagination">{{itemTitle}}</span>',
    'pageItemRemainHtml': '<span class="Pagination__NavItem">{{itemTitle}}</span>',
    'paginateHtml': ' <div class="Pagination Text--subdued"><div class="Pagination__Nav">{{previous}}{{pageItems}}{{next}}</div></div>',
    // Sorting Template
//     'sortingHtml': '{{sortingItems}}',
	'sortingHtml': '<label><span><span>' + bcSfFilterConfig.label.sorting + '</span></span></label><ul class="bc-sf-filter-filter-dropdown">{{sortingItems}}</ul>',
};

/************************** CUSTOMIZE DATA BEFORE BUILDING PRODUCT ITEM **************************/
function prepareShopifyData(data) {
  // Displaying price base on the policy of Shopify, have to multiple by 100
  soldOut = !data.available; // Check a product is out of stock
  onSale = data.compare_at_price_min > data.price_min; // Check a product is on sale
  priceVaries = data.price_min != data.price_max; // Check a product has many prices
  // Convert images to array
  images = data.images_info;
  // Get First Variant (selected_or_first_available_variant)
  var firstVariant = data['variants'][0];
  if (getParam('variant') !== null && getParam('variant') != '') {
    var paramVariant = data.variants.filter(function(e) { return e.id == getParam('variant'); });
    if (typeof paramVariant[0] !== 'undefined') firstVariant = paramVariant[0];
  } else {
    for (var i = 0; i < data['variants'].length; i++) {
      if (data['variants'][i].available) {
        firstVariant = data['variants'][i];
        break;
      }
    }
  }
  return data;
}
/************************** END CUSTOMIZE DATA BEFORE BUILDING PRODUCT ITEM **************************/
/************************** BUILD PRODUCT LIST **************************/
// Build Product Grid Item
BCSfFilter.prototype.buildProductGridItem = function(data, index) {
  // Get Template
  var itemHtml = bcSfFilterTemplate.productGridItemHtml;
  // Customize API data to get the Shopify data
  data = prepareShopifyData(data);
  // Add Custom class
  var soldOutClass = soldOut ? bcSfFilterTemplate.soldOutClass : '';
  var saleClass = onSale ? bcSfFilterTemplate.saleClass : '';
  // Add Label
  itemHtml = itemHtml.replace(/{{itemLabels}}/g, buildLabels(data));

  // Add Images
  itemHtml = itemHtml.replace(/{{itemImages}}/g, buildImage(data, images));

  // Add main attribute (Always put at the end of this function)
  itemHtml = itemHtml.replace(/{{itemInfo}}/g, buildInfo(data, index));
  itemHtml = itemHtml.replace(/{{itemUrl}}/g, this.buildProductItemUrl(data));

  itemHtml = itemHtml.replace(/{{itemId}}/g, data.id);

  return itemHtml;
};

/************************** END BUILD PRODUCT LIST **************************/
/************************** BUILD PRODUCT ITEM ELEMENTS **************************/
function buildClass() {
  return bcSfFilterConfig.custom.filter_position == 'drawer' ? 'lap-and-up' : 'desk';
}

function buildClassHiz() {
  return bcSfFilterConfig.custom.use_horizontal ? 'ProductItem--horizontal' : '';
}

function buildButtonSecond() {
  return bcSfFilterConfig.custom.use_horizontal ? '<a href="{{itemUrl}}" class="ProductItem__ViewButton Button Button--secondary hidden-pocket">' + bcSfFilterConfig.label.view_product + '</a>' : '';
}

function buildImage(data, images) {
  var htmlImg = '';
  if (images.length > 0) {
    htmlImg += '<a href="{{itemUrl}}" class="ProductItem__ImageWrapper ';
    var use_natural_size = false;
    var has_alternate_image = false;
    if (bcSfFilterConfig.custom.product_image_size == 'natural' || bcSfFilterConfig.custom.use_horizontal)
      use_natural_size = true;
    if (bcSfFilterConfig.custom.product_show_secondary_image && images.length > 1 && !bcSfFilterConfig.custom.use_horizontal)
      has_alternate_image = true;
    if (has_alternate_image)
      htmlImg += 'ProductItem__ImageWrapper--withAlternateImage';
    htmlImg += '">';
    var max_width = images[0].width;
    if (bcSfFilterConfig.custom.use_horizontal)
      max_width = 125;
    var withCall = use_natural_size ? 'withFallback' : bcSfFilterConfig.custom.product_image_size;
    htmlImg += '<div class="AspectRatio AspectRatio--' + withCall + '" style="max-width: ' + max_width + 'px;';
    var aspect_ratio = images[0].width / images[0].height;
    if (use_natural_size) {
      htmlImg += 'padding-bottom: ' + (100 / aspect_ratio) + '%;';
    }
    htmlImg += ' --aspect-ratio: ' + aspect_ratio + '">';
    if (has_alternate_image && images.length > 1) {
      var sizes = '200,300,400,600,800,900,1000,1200';
      var support_size = imageSize(sizes, images[1]);
      var thumbUrl = bcsffilter.optimizeImage(images[1]['src'], '{width}x');
      htmlImg += '<img class="ProductItem__Image ProductItem__Image--alternate Image--lazyLoad Image--fadeIn" data-src="' + thumbUrl + '" data-widths="[' + support_size + ']" data-sizes="auto" alt="' + data.title + '" data-image-id="' + images[1].id + '">';
    }

    var sizes_main = '200,400,600,700,800,900,1000,1200';
    var support_size = imageSize(sizes_main, images[0]);
    var thumbUrl_main = images.length > 0 ? bcsffilter.optimizeImage(images[0]['src'], '{width}x') : bcSfFilterConfig.general.no_image_url;
    htmlImg += '<img class="ProductItem__Image Image--lazyLoad Image--fadeIn" data-src="' + thumbUrl_main + '" data-widths="[' + support_size + ']" data-sizes="auto" alt="' + data.title + '" data-image-id="' + images[0].id + '">';
    htmlImg += '<span class="Image__Loader"></span>';
    htmlImg += '<noscript>';
    htmlImg += '<img class="ProductItem__Image ProductItem__Image--alternate" src="' + bcsffilter.optimizeImage(images[0]['src'], '600x') + '" alt="' + data.title + '">';
    htmlImg += '<img class="ProductItem__Image" src="' + bcsffilter.optimizeImage(images[0]['src'], '600x') + '" alt="' + data.title + '">';
    htmlImg += '</noscript>';
    htmlImg += '</div>';
    htmlImg += '</a>';
  }
  return htmlImg;
}

function imageSize(sizes, image) {
  if (image) {
    var desired_sizes = sizes.split(',');
    var supported_sizes = '';
    for (var k = 0; k < desired_sizes.length; k++) {
      var size = desired_sizes[k];
      var size_as_int = size * 1;
      if (image.width < size_as_int) { break; }
      supported_sizes = supported_sizes + size + ',';
    }
    if (supported_sizes == '')
      supported_sizes = image.width;

    if (!jQ.isNumeric(supported_sizes)) {
      supported_sizes = supported_sizes.split(',').join(',');
      supported_sizes = supported_sizes.substring(0, supported_sizes.lastIndexOf(','));
    }
    return supported_sizes;
  } else {
    return '';
  }
}

function buildPrice(data) {
  var html = '';
  var show_price_on_hover = bcSfFilterConfig.custom.product_show_price_on_hover;
  var classPriceHover = show_price_on_hover ? 'ProductItem__PriceList--showOnHover' : '';
  html += '<div class="ProductItem__PriceList ' + classPriceHover + ' Heading">';
  if (onSale) {
    html += '<span class="ProductItem__Price Price Price--highlight Text--subdued" data-money-convertible>' + bcsffilter.formatMoney(data.price_min) + '</span> ';
    html += '<span class="ProductItem__Price Price Price--compareAt Text--subdued" data-money-convertible>' + bcsffilter.formatMoney(data.compare_at_price_min) + '</span>';
  } else {
    if (priceVaries) {
      html += '<span class="ProductItem__Price Price Text--subdued">' + bcSfFilterConfig.label_basic.from.replace(/{{min_price}}/g, bcsffilter.formatMoney(data.price_min)) + '</span>';
    } else {
      html += '<span class="ProductItem__Price Price Text--subdued" data-money-convertible>' + bcsffilter.formatMoney(data.price_min) + '</span>';
    }
  }
  html += '</div>';
  return html;
}

function buildLabels(data) {
  var product_labels = ''
  if (bcSfFilterConfig.custom.show_labels) {
    product_labels = '';
    var tags = data.tags;
    for (var k = 0; k < tags.length; k++) {
      var tag = tags[k];
      if (tag.indexOf('__label') != -1) {
        product_labels += '<span class="ProductItem__Label Heading Text--subdued">' + tag.split('__label:')[1] + '</span>';
        break;
      }
    }
    if (!soldOut) {
      if (onSale)
        product_labels += '<span class="ProductItem__Label Heading Text--subdued">' + bcSfFilterConfig.label_basic.sale + '</span>';
    } else {
      product_labels += ' <span class="ProductItem__Label Heading Text--subdued">' + bcSfFilterConfig.label_basic.sold_out + '</span>';
    }
    var html = '';
    if (product_labels != '') {
      html += '<div class="ProductItem__LabelList">';
      html += product_labels;
      html += '</div>';
    }
  }
  return html;
}

function buildInfo(data, indx) {
  var html = '';
  if (bcSfFilterConfig.custom.show_product_info) {
    var infoClass = (!bcSfFilterConfig.custom.use_horizontal) ? 'ProductItem__Info--' + bcSfFilterConfig.custom.product_info_alignment : '';
    html += '<div class="ProductItem__Info ' + infoClass + ' ">';
    html += '<h2 class="ProductItem__Title Heading">';
    html += '<p class="ProductItem__Vendor Heading">' + data.vendor + '</p>';
    html += '<a href="{{itemUrl}}">' + data.title + '</a>';
    html += '</h2>';
//     html += '<div class="ProductItem__type">' + data.product_type + '</div>';
    if (bcSfFilterConfig.custom.product_show_price_on_hover) {
      html += buildSwatch(data, bcsffilter, indx);
      html += buildPrice(data);
    } else {
      html += buildPrice(data);
      html += buildSwatch(data, bcsffilter, indx);
    }
    html += '</div>';
  }
  return html;
}

function buildSwatch(data, ob, indx) {
  var _this = ob;
  var itemSwatchHtml = '';
  if (bcSfFilterConfig.custom.show_color_swatch) {
    var color_name = bcSfFilterConfig.custom.section_id + '-' + data.id + '-' + indx;
    data.options_with_values.forEach(function(option, index) {
      var option_name = option.name.toLowerCase();
      if (option_name.indexOf('color') != -1 || option_name.indexOf('colour') != -1 || option_name.indexOf('couleur') != -1) {
        var values = '';
        itemSwatchHtml += '<div class="ProductItem__ColorSwatchList">';
        var i = 0;
        data.variants.forEach(function(variant) {
          var temp = variant.merged_options.filter(function(obj) {
            obj = obj.toLowerCase();
            if (obj.indexOf('color') != -1 || obj.indexOf('colour') != -1)
              return obj;
          });
          temp = temp[0].split(':');
          var value = temp[1].toLowerCase();
          if (values.indexOf(value) == -1) {
            values = values + ',' + value;
            values = values.split(',');
            var size = '200,400,600,700,800,900,1000,1200';
            var supported_sizes = imageSize(size, variant.image);
            var color_image = _this.optimizeImage(variant.image);
            var name_color = value + '.png';
            var checked = (i == 0) ? 'checked=checked' : '';
            var dataImg = (variant.image != null) ? 'data-image-id="" data-image-url="' + variant.image + '" data-image-widths="[' + supported_sizes + ']" data-image-aspect-ratio="1"' : '';
            var url_color = bcSfFilterMainConfig.general.asset_url.replace('bc-sf-filter.js', name_color);
            itemSwatchHtml += '<div class="ProductItem__ColorSwatchItem">';
            itemSwatchHtml += '<input class="ColorSwatch__Radio" type="radio" ' + checked + ' name="' + color_name + '" id="' + color_name + '" value="' + value + '" data-variant-url="' + _this.buildProductItemUrl(data) + '?variant=' + variant.id + '"' + dataImg + '  aria-hidden="true">';
            itemSwatchHtml += '<label class="ColorSwatch ColorSwatch--small" for="' + color_name + '" style="background-color: ' + value.replace(' ', '').toLowerCase() + '; background-image: url(' + url_color + ')" title="' + value + '" data-tooltip="' + value + '"></label>';
            itemSwatchHtml += '</div>';
            i++;
          }
        });
        itemSwatchHtml += '</div>';
      }
    });
  }
  return itemSwatchHtml;
}
/************************** END BUILD PRODUCT ITEM ELEMENTS **************************/
/************************** BUILD TOOLBAR **************************/
// Build Pagination
BCSfFilter.prototype.buildPagination = function(totalProduct) {
  // Get page info
  var currentPage = parseInt(this.queryParams.page);
  var totalPage = Math.ceil(totalProduct / this.queryParams.limit);
  // If it has only one page, clear Pagination
  if (totalPage == 1) {
    jQ(this.selector.pagination).html('');
    return false;
  }
  if (this.getSettingValue('general.paginationType') == 'default') {
    var paginationHtml = bcSfFilterTemplate.paginateHtml;
    // Build Previous
    var previousHtml = (currentPage > 1) ? bcSfFilterTemplate.previousActiveHtml : bcSfFilterTemplate.previousDisabledHtml;
    previousHtml = previousHtml.replace(/{{itemUrl}}/g, this.buildToolbarLink('page', currentPage, currentPage - 1));
    paginationHtml = paginationHtml.replace(/{{previous}}/g, previousHtml);
    // Build Next
    var nextHtml = (currentPage < totalPage) ? bcSfFilterTemplate.nextActiveHtml : bcSfFilterTemplate.nextDisabledHtml;
    nextHtml = nextHtml.replace(/{{itemUrl}}/g, this.buildToolbarLink('page', currentPage, currentPage + 1));
    paginationHtml = paginationHtml.replace(/{{next}}/g, nextHtml);
    // Create page items array
    var beforeCurrentPageArr = [];
    for (var iBefore = currentPage - 1; iBefore > currentPage - 3 && iBefore > 0; iBefore--) {
      beforeCurrentPageArr.unshift(iBefore);
    }
    if (currentPage - 4 > 0) {
      beforeCurrentPageArr.unshift('...');
    }
    if (currentPage - 4 >= 0) {
      beforeCurrentPageArr.unshift(1);
    }
    beforeCurrentPageArr.push(currentPage);
    var afterCurrentPageArr = [];
    for (var iAfter = currentPage + 1; iAfter < currentPage + 3 && iAfter <= totalPage; iAfter++) {
      afterCurrentPageArr.push(iAfter);
    }
    if (currentPage + 3 < totalPage) {
      afterCurrentPageArr.push('...');
    }
    if (currentPage + 3 <= totalPage) {
      afterCurrentPageArr.push(totalPage);
    }
    // Build page items
    var pageItemsHtml = '';
    var pageArr = beforeCurrentPageArr.concat(afterCurrentPageArr);
    for (var iPage = 0; iPage < pageArr.length; iPage++) {
      if (pageArr[iPage] == '...') {
        pageItemsHtml += bcSfFilterTemplate.pageItemRemainHtml;
      } else {
        pageItemsHtml += (pageArr[iPage] == currentPage) ? bcSfFilterTemplate.pageItemSelectedHtml : bcSfFilterTemplate.pageItemHtml;
      }
      pageItemsHtml = pageItemsHtml.replace(/{{itemTitle}}/g, pageArr[iPage]);
      pageItemsHtml = pageItemsHtml.replace(/{{itemUrl}}/g, this.buildToolbarLink('page', currentPage, pageArr[iPage]));
    }
    paginationHtml = paginationHtml.replace(/{{pageItems}}/g, pageItemsHtml);
    jQ(this.selector.pagination).html(paginationHtml);
  }
};

BCSfFilter.prototype.buildFilterSorting = function() {
  if (bcSfFilterTemplate.hasOwnProperty('sortingHtml')) {
    jQ(this.selector.topSorting).html('');
    var sortingArr = this.getSortingList();
    if (sortingArr) {
      var url = new URL(window.location.href);
      var paramSort = url.searchParams.get("sort");
      // Build content
      var sortingItemsHtml = '';
      for (var k in sortingArr) {
        var activeClass = '';
        if(paramSort == k) {
          activeClass = 'active';
        }
        sortingItemsHtml += '<li><a href="#" data-sort="' + k + '" class="' + activeClass+ '">' + sortingArr[k] + '</a></li>';
      }
      var html = bcSfFilterTemplate.sortingHtml.replace(/{{sortingItems}}/g, sortingItemsHtml);
      jQ('.bc-sf-filter-custom-sorting').html(html);
      if(jQ('.bc-sf-filter-custom-sorting').hasClass("bc-sf-filter-sort-active")) {
        jQ('.bc-sf-filter-custom-sorting').toggleClass('bc-sf-filter-sort-active');
      }

      jQ(".bc-sf-filter-custom-sorting > label").click(function(){
        if (!jQ('.bc-sf-filter-filter-dropdown').is(':animated')) {
          jQ('.bc-sf-filter-filter-dropdown').toggle().parent().toggleClass('bc-sf-filter-sort-active');
          jQ('#bc-sf-filter-tree').hide();
        }
      });
    }
  }
};

// Build Sorting event
BCSfFilter.prototype.buildSortingEvent = function() {
  var _this = this;
  jQ('.bc-sf-filter-filter-dropdown a').click(function(e){
    e.preventDefault();
    onInteractWithToolbar(e, 'sort', _this.queryParams.sort, jQ(this).data('sort'));
  })

  // For Sort By 
  var url_string = document.URL
  var url = new URL(url_string);
  var labelSort = url.searchParams.get("sort");
  if(labelSort == null) {
    labelSort = bcSfFilterConfig.label.sorting;
  } else {
    // labelSort = bcSfFilterConfig.label['sorting_' + labelSort.replace('-', '_')]
    switch (labelSort) {
      case 'best-selling': 
        labelSort = bcSfFilterConfig.label['sorting_best_selling'];
        break;
      case 'manual': 
        labelSort = bcSfFilterConfig.label['sorting_featured'];
        break;
      case 'price-ascending': 
        labelSort = bcSfFilterConfig.label['sorting_price_ascending'];
        break;
      case 'price-descending': 
        labelSort = bcSfFilterConfig.label['sorting_price_descending'];
        break;
      case 'title-ascending': 
        labelSort = bcSfFilterConfig.label['sorting_title_ascending'];
        break;
      case 'title-descending': 
        labelSort = bcSfFilterConfig.label['sorting_title_descending'];
        break;
      case 'created-ascending':
        labelSort = bcSfFilterConfig.label['sorting_date_ascending'];
        break;
      case 'created-descending':
        labelSort = bcSfFilterConfig.label['sorting_date_descending'];
        break;
    }
  }
  $('.bc-sf-filter-custom-sorting label span span').text(labelSort);

  jQ(this.getSelector('filterTreeMobileButton')).click(function(){
    jQ('#bc-sf-filter-top-sorting-mobile .bc-sf-filter-filter-dropdown').hide();
  })

  jQ(jQ(this.selector.filterTreeHorizontal).find('.' + this.class.filterBlockTitle).children('a')).click(function(){
    jQ('.bc-sf-filter-custom-sorting .bc-sf-filter-filter-dropdown').hide();
  })

  // End - For Sort By 
};

// // Build Sorting
// BCSfFilter.prototype.buildFilterSorting = function() {
//   if (bcSfFilterConfig.custom.show_sorting && bcSfFilterTemplate.hasOwnProperty('sortingHtml')) {
//     jQ(this.selector.topSorting).html('');
//     var sortingArr = this.getSortingList();
//     if (sortingArr) {
//       // Build content
//       var sortingItemsHtml = '';
//       for (var k in sortingArr) {
//         var classActive = (this.queryParams.sort == k) ? 'is-selected' : '';
//         sortingItemsHtml += '<button class="Popover__Value ' + classActive + ' Heading Link Link--primary u-h6" data-value="' + k + '">' + sortingArr[k] + '</button>';
//       }
//       var html = bcSfFilterTemplate.sortingHtml.replace(/{{sortingItems}}/g, sortingItemsHtml);
//       jQ(this.selector.topSorting).html(html);
//     }
//   }
// };

// // Build Sorting event
// BCSfFilter.prototype.buildSortingEvent = function() {
//   var _this = this;
//   var topSortingSelector = jQ(this.selector.topSorting);
//   topSortingSelector.find('.Popover__Value').click(function(e) {
//     onInteractWithToolbar(e, 'sort', _this.queryParams.sort, jQ(this).data('value'));
//   })
// };

/************************** END BUILD TOOLBAR **************************/

// Add additional feature for product list, used commonly in customizing product list
BCSfFilter.prototype.buildExtrasProductList = function(data, eventType) {
  // Get theme script 
  buildTheme();


  // Fix image not load on Instagram browser - initialize swatch image
  // $(".ProductItem__Info .ProductItem__ColorSwatchList .ProductItem__ColorSwatchItem label.ColorSwatch").click(function(){
  //   $(this).parent().parent().find('label.ColorSwatch').removeClass('active');
  //   $(this).addClass('active');
  //   var parent = $(this).parent();
  //   var productImage = $(this).parent().parent().parent().parent().find('a.ProductItem__ImageWrapper');
  //   var variantInfo = parent.find('input.ColorSwatch__Radio');
  //   productImage.find('.AspectRatio .bc-sf-product-swatch-img').remove();
  //   productImage.find('.AspectRatio').prepend('<img class="bc-sf-product-swatch-img" src="' + variantInfo.data('image-url') + '" />');
  //   productImage.find('img.ProductItem__Image').hide();
  //   productImage.attr('href', variantInfo.data('variant-url'));
  //   console.log(variantInfo);
  //   $(this).closest('.ProductItem__Wrapper').find('.ProductItem__PriceList').html('<span class="ProductItem__Price Price Text--subdued" data-money-convertible>' + bcsffilter.formatMoney(variantInfo.data('variant-price')) + '</span>');
  // })
};

// Build additional elements
BCSfFilter.prototype.buildAdditionalElements = function(data, eventType) {

};

function buildTheme(){
  var _createClass = function() { function e(e, t) { for (var n = 0; n < t.length; n++) { var i = t[n]; i.enumerable = i.enumerable || !1, i.configurable = !0, "value" in i && (i.writable = !0), Object.defineProperty(e, i.key, i) } } return function(t, n, i) { return n && e(t.prototype, n), i && e(t, i), t } }(); ([function(e, t, n) { "use strict"; Object.defineProperty(t, "__esModule", { value: !0 }); var i = function() { function e() { _classCallCheck(this, e) } return _createClass(e, null, [{ key: "getSiblings", value: function(e, t) { for (var n = arguments.length > 2 && void 0 !== arguments[2] && arguments[2], i = [], a = e; a = a.previousElementSibling;) t && !a.matches(t) || i.push(a); for (n && i.push(e), a = e; a = a.nextElementSibling;) t && !a.matches(t) || i.push(a); return i } }, { key: "nodeListToArray", value: function(e, t) { for (var n = [], i = 0; i !== e.length; ++i) t && !e[i].matches(t) || n.push(e[i]); return n } }, { key: "outerWidthWithMargin", value: function(e) { var t = e.offsetWidth, n = getComputedStyle(e); return t += parseInt(n.marginLeft) + parseInt(n.marginRight) } }, { key: "outerHeightWithMargin", value: function(e) { var t = e.offsetHeight, n = getComputedStyle(e); return t += parseInt(n.marginTop) + parseInt(n.marginBottom) } }]), e }(); t["default"] = i }, function(e, t, n) { "use strict"; Object.defineProperty(t, "__esModule", { value: !0 }); var i = n(2), a = function() { function e(t) { var n = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {}; _classCallCheck(this, e), this.element = t, this.initialConfig = JSON.parse(t.getAttribute("data-flickity-config")), this.options = n, this._attachListeners(), this._build() } return _createClass(e, [{ key: "destroy", value: function() { this.flickityInstance.destroy(), void 0 !== this.initialConfig.breakpoints && document.removeEventListener("breakpoint:changed", this._onBreakpointChangedListener) } }, { key: "selectCell", value: function(e) { var t = arguments.length > 1 && void 0 !== arguments[1] && arguments[1], n = !(arguments.length > 2 && void 0 !== arguments[2]) || arguments[2]; t && this.flickityInstance.pausePlayer(), this.flickityInstance.select(e, !1, !n) } }, { key: "pausePlayer", value: function() { this.flickityInstance.pausePlayer() } }, { key: "unpausePlayer", value: function() { this.flickityInstance.unpausePlayer() } }, { key: "resize", value: function() { this.flickityInstance.resize() } }, { key: "getSelectedIndex", value: function() { return this.flickityInstance.selectedIndex } }, { key: "getSelectedCell", value: function() { return this.flickityInstance.selectedCell.element } }, { key: "_attachListeners", value: function() { void 0 !== this.initialConfig.breakpoints && (this._onBreakpointChangedListener = this._onBreakpointChanged.bind(this), document.addEventListener("breakpoint:changed", this._onBreakpointChangedListener)) } }, { key: "_build", value: function() { var e = this, t = this._processConfig(); this.flickityInstance = new Flickity(this.element, t), this._validateDraggable(), this.selectedIndex = this.flickityInstance.selectedIndex, this.flickityInstance.on("resize", this._validateDraggable.bind(this)), this.options.onSelect && this.flickityInstance.on("select", function() { e.selectedIndex !== e.flickityInstance.selectedIndex && (e.options.onSelect(e.flickityInstance.selectedIndex, e.flickityInstance.selectedCell.element), e.selectedIndex = e.flickityInstance.selectedIndex) }), this.options.onClick && this.flickityInstance.on("staticClick", function(t, n, i, a) { e.options.onClick(i, a) }) } }, { key: "_validateDraggable", value: function() { var e = this.flickityInstance.isActive || !1; e && this.flickityInstance.options.draggable && (void 0 === this.flickityInstance.selectedElements || this.flickityInstance.selectedElements.length === this.flickityInstance.cells.length ? this.flickityInstance.unbindDrag() : this.flickityInstance.bindDrag()) } }, { key: "_processConfig", value: function() { var e = Object.assign({}, this.initialConfig); if (delete e.breakpoints, void 0 === this.initialConfig.breakpoints) return e; var t = this.initialConfig.breakpoints; return t.forEach(function(t) { i["default"].matchesBreakpoint(t.matches) && (e = Object.assign(e, t.settings)) }), e } }, { key: "_onBreakpointChanged", value: function() { this.flickityInstance.destroy(), this._build() } }]), e }(); t["default"] = a }, function(e, t, n) { "use strict"; Object.defineProperty(t, "__esModule", { value: !0 }); var i = function() { function e() { var t = this; _classCallCheck(this, e), this.currentBreakpoint = e.getCurrentBreakpoint(), window.addEventListener("resize", function() { var n = e.getCurrentBreakpoint(); t.currentBreakpoint !== n && (document.dispatchEvent(new CustomEvent("breakpoint:changed", { detail: { previousBreakpoint: t.currentBreakpoint, currentBreakpoint: n } })), t.currentBreakpoint = n) }) } return _createClass(e, null, [{ key: "matchesBreakpoint", value: function(e) { switch (e) { case "phone": return window.matchMedia("screen and (max-width: 640px)").matches; case "tablet": return window.matchMedia("screen and (min-width: 641px) and (max-width: 1007px)").matches; case "tablet-and-up": return window.matchMedia("screen and (min-width: 641px)").matches; case "pocket": return window.matchMedia("screen and (max-width: 1007px)").matches; case "lap": return window.matchMedia("screen and (min-width: 1008px) and (max-width: 1279px)").matches; case "lap-and-up": return window.matchMedia("screen and (min-width: 1008px)").matches; case "desk": return window.matchMedia("screen and (min-width: 1280px)").matches; case "widescreen": return window.matchMedia("screen and (min-width: 1600px)").matches } } }, { key: "getCurrentBreakpoint", value: function() { return window.matchMedia("screen and (max-width: 640px)").matches ? "phone" : window.matchMedia("screen and (min-width: 641px) and (max-width: 1007px)").matches ? "tablet" : window.matchMedia("screen and (min-width: 1008px) and (max-width: 1279px)").matches ? "lap" : window.matchMedia("screen and (min-width: 1280px)").matches ? "desk" : void 0 } }]), e }(); t["default"] = i }]);
}

// Build Default layout
function buildDefaultLink(a,b){var c=window.location.href.split("?")[0];return c+="?"+a+"="+b}BCSfFilter.prototype.buildDefaultElements=function(a){if(bcSfFilterConfig.general.hasOwnProperty("collection_count")&&jQ("#bc-sf-filter-bottom-pagination").length>0){var b=bcSfFilterConfig.general.collection_count,c=parseInt(this.queryParams.page),d=Math.ceil(b/this.queryParams.limit);if(1==d)return jQ(this.selector.pagination).html(""),!1;if("default"==this.getSettingValue("general.paginationType")){var e=bcSfFilterTemplate.paginateHtml,f="";f=c>1?bcSfFilterTemplate.hasOwnProperty("previousActiveHtml")?bcSfFilterTemplate.previousActiveHtml:bcSfFilterTemplate.previousHtml:bcSfFilterTemplate.hasOwnProperty("previousDisabledHtml")?bcSfFilterTemplate.previousDisabledHtml:"",f=f.replace(/{{itemUrl}}/g,buildDefaultLink("page",c-1)),e=e.replace(/{{previous}}/g,f);var g="";g=c<d?bcSfFilterTemplate.hasOwnProperty("nextActiveHtml")?bcSfFilterTemplate.nextActiveHtml:bcSfFilterTemplate.nextHtml:bcSfFilterTemplate.hasOwnProperty("nextDisabledHtml")?bcSfFilterTemplate.nextDisabledHtml:"",g=g.replace(/{{itemUrl}}/g,buildDefaultLink("page",c+1)),e=e.replace(/{{next}}/g,g);for(var h=[],i=c-1;i>c-3&&i>0;i--)h.unshift(i);c-4>0&&h.unshift("..."),c-4>=0&&h.unshift(1),h.push(c);for(var j=[],k=c+1;k<c+3&&k<=d;k++)j.push(k);c+3<d&&j.push("..."),c+3<=d&&j.push(d);for(var l="",m=h.concat(j),n=0;n<m.length;n++)"..."==m[n]?l+=bcSfFilterTemplate.pageItemRemainHtml:l+=m[n]==c?bcSfFilterTemplate.pageItemSelectedHtml:bcSfFilterTemplate.pageItemHtml,l=l.replace(/{{itemTitle}}/g,m[n]),l=l.replace(/{{itemUrl}}/g,buildDefaultLink("page",m[n]));e=e.replace(/{{pageItems}}/g,l),jQ(this.selector.pagination).html(e)}}if(bcSfFilterTemplate.hasOwnProperty("sortingHtml")&&jQ(this.selector.topSorting).length>0){jQ(this.selector.topSorting).html("");var o=this.getSortingList();if(o){var p="";for(var q in o)p+='<option value="'+q+'">'+o[q]+"</option>";var r=bcSfFilterTemplate.sortingHtml.replace(/{{sortingItems}}/g,p);jQ(this.selector.topSorting).html(r);var s=void 0!==this.queryParams.sort_by?this.queryParams.sort_by:this.defaultSorting;jQ(this.selector.topSorting+" select").val(s),jQ(this.selector.topSorting+" select").change(function(a){window.location.href=buildDefaultLink("sort_by",jQ(this).val())})}}};

BCSfFilter.prototype.prepareProductData = function(data) { var countData = data.length; for (var k = 0; k < countData; k++) { data[k]['images'] = data[k]['images_info']; if (data[k]['images'].length > 0) { data[k]['featured_image'] = data[k]['images'][0] } else { data[k]['featured_image'] = { src: bcSfFilterConfig.general.no_image_url, width: '', height: '', aspect_ratio: 0 } } data[k]['url'] = '/products/' + data[k].handle; var optionsArr = []; var countOptionsWithValues = data[k]['options_with_values'].length; for (var i = 0; i < countOptionsWithValues; i++) { optionsArr.push(data[k]['options_with_values'][i]['name']) } data[k]['options'] = optionsArr; if (typeof bcSfFilterConfig.general.currencies != 'undefined' && bcSfFilterConfig.general.currencies.length > 1) { var currentCurrency = bcSfFilterConfig.general.current_currency.toLowerCase().trim(); function updateMultiCurrencyPrice(oldPrice, newPrice) { if (typeof newPrice != 'undefined') { return newPrice; } return oldPrice; } data[k].price_min = updateMultiCurrencyPrice(data[k].price_min, data[k]['price_min_' + currentCurrency]); data[k].price_max = updateMultiCurrencyPrice(data[k].price_max, data[k]['price_max_' + currentCurrency]); data[k].compare_at_price_min = updateMultiCurrencyPrice(data[k].compare_at_price_min, data[k]['compare_at_price_min_' + currentCurrency]); data[k].compare_at_price_max = updateMultiCurrencyPrice(data[k].compare_at_price_max, data[k]['compare_at_price_max_' + currentCurrency]); } data[k]['price_min'] *= 100, data[k]['price_max'] *= 100, data[k]['compare_at_price_min'] *= 100, data[k]['compare_at_price_max'] *= 100; data[k]['price'] = data[k]['price_min']; data[k]['compare_at_price'] = data[k]['compare_at_price_min']; data[k]['price_varies'] = data[k]['price_min'] != data[k]['price_max']; var firstVariant = data[k]['variants'][0]; if (getParam('variant') !== null && getParam('variant') != '') { var paramVariant = data.variants.filter(function(e) { return e.id == getParam('variant') }); if (typeof paramVariant[0] !== 'undefined') firstVariant = paramVariant[0] } else { var countVariants = data[k]['variants'].length; for (var i = 0; i < countVariants; i++) { if (data[k]['variants'][i].available) { firstVariant = data[k]['variants'][i]; break } } } data[k]['selected_or_first_available_variant'] = firstVariant; var countVariants = data[k]['variants'].length; for (var i = 0; i < countVariants; i++) { var variantOptionArr = []; var count = 1; var variant = data[k]['variants'][i]; var variantOptions = variant['merged_options']; if (Array.isArray(variantOptions)) { var countVariantOptions = variantOptions.length; for (var j = 0; j < countVariantOptions; j++) { var temp = variantOptions[j].split(':'); data[k]['variants'][i]['option' + (parseInt(j) + 1)] = temp[1]; data[k]['variants'][i]['option_' + temp[0]] = temp[1]; variantOptionArr.push(temp[1]) } data[k]['variants'][i]['options'] = variantOptionArr } data[k]['variants'][i]['compare_at_price'] = parseFloat(data[k]['variants'][i]['compare_at_price']) * 100; data[k]['variants'][i]['price'] = parseFloat(data[k]['variants'][i]['price']) * 100 } data[k]['description'] = data[k]['content'] = data[k]['body_html']; } return data };