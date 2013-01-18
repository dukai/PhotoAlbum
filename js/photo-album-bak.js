var SCPhotoAlbum = function(containerId, thumbsId, showContainerId){
	this.configs = {
		thumbWidth: 68,
		thumbsWidth: 680,
		showWidth: 718,
		showHeight: 800,
		thumbPrefix: 'img_',
		selectedClass: 'selected',
		middleurl: 'middleurl',
		bigurl: 'bigurl',
		photoGallaryPre: 'pg_pre',
		photoGallaryNext: 'pg_next',
		photoShowPre: 'ps_pre',
		photoShowNext: 'ps_next',
		thumb: 'thumb',
		photoGallaryBtnEnable: 'enable',
		photoGallaryBtnDisable: 'disable'
	}
	this.cursor = 0;
	this.containerId = containerId;
	this.thumbsId = thumbsId;
	this.showContainerId = showContainerId;
	this.total = $('#' + thumbsId + ' li').length;
	this.isRunning = false;
	this.initialize();
};

SCPhotoAlbum.prototype = {
	initialize: function(){
		this.showThumbCount = parseInt(this.configs.thumbsWidth / this.configs.thumbWidth);
		this.maxOffset = (this.total - this.showThumbCount) * this.configs.thumbWidth;
		//$('.' + this.configs.photoShowNext).hide();
		//$('.' + this.configs.photoShowPre).hide();
		this.checkGallaryBtnsStatus();
		this.initDom();
		this.initEvent();
	},
	initDom: function(){
		
		this.show(0);
		$('#' + this.thumbsId).css({'width': this.configs.thumbWidth * this.total, left: 0});
	},
	initEvent: function(){
		$('#' + this.containerId).click(dk.bind(this,this.eventDelegate));
		/*
		$('#' + this.showContainerId).hover(dk.bind(this, function(e){
			$('.' + this.configs.photoShowNext).fadeIn('fast');
			$('.' + this.configs.photoShowPre).fadeIn('fast');
		}), dk.bind(this, function(e){
			$('.' + this.configs.photoShowNext).fadeOut('fast');
			$('.' + this.configs.photoShowPre).fadeOut('fast');
		}));
		*/
	},
	eventDelegate: function(e){
		if(this.isRunning){
			return;
		}
		var target = e.target;
		if(target.className == this.configs.photoGallaryPre){
			this.gallaryPre(5);
		}else if(target.className == this.configs.photoGallaryNext){
			this.gallaryNext(5);
		}else if(target.className == this.configs.photoShowPre){
			this.preview();
		}else if(target.className == this.configs.photoShowNext){
			this.next();
		}else if(dk.tagName(target) == 'img' && $(target.parentNode).hasClass(this.configs.thumb) || dk.tagName(target) == 'li' && $(target).hasClass(this.configs.thumb)){
			if(dk.tagName(target) == 'img'){
				target = target.parentNode;
			}
			var currId = target.id;
			currId = parseInt(currId.replace(this.configs.thumbPrefix, ''));
			if(currId == this.cursor){
				return;
			}
			$('#' + this.configs.thumbPrefix + this.cursor).removeClass(this.configs.selectedClass);
			dk.logs.write('#' + this.configs.thumbPrefix + this.cursor + "'s selected class name has been removed and next " + currId + ' will be displayed');
			this.show(currId);
			this.cursor = currId;
		}
		this.isRunning = false;
	},
	gallaryPre: function(step){
		var value,
			thumbWidth = this.configs.thumbWidth, 
			thumbsId = this.thumbsId, 
			currOffset = Math.abs(parseInt($('#' + thumbsId).css('left')));
		if(step){
			var moveOffset = thumbWidth * step;
			if(currOffset > moveOffset){
				value = '+=' + moveOffset + 'px';
			}else{
				value = '+=' + currOffset + 'px';
			}
			
		}else{
			value = '+=' + this.configs.thumbWidth + 'px';
		}
		
		if(parseInt($('#' + this.thumbsId).css('left')) >= 0)
			return;
		$('#' + this.thumbsId).animate({'left': value},'fast', 'linear', dk.bind(this, function(){
			this.isRunning = false;
		}));
	},
	gallaryNext: function(step){
		var value, 
			thumbWidth = this.configs.thumbWidth, 
			thumbsId = this.thumbsId, 
			currOffset = Math.abs(parseInt($('#' + thumbsId).css('left')));
		if(step){
			var moveOffset = thumbWidth * step;
			
			if(this.maxOffset - currOffset > moveOffset)
				value = '-=' + moveOffset + 'px';
			else{
				value = '-=' + (this.maxOffset - currOffset) + 'px';
			}
		}else{
			value = '-=' + thumbWidth + 'px';
		}
		if(parseInt($('#' + thumbsId).css('left')) <= -(thumbWidth * this.total - this.configs.thumbsWidth)){
			return;
		}
		$('#' + thumbsId).animate({'left': value}, 'fast', "linear", dk.bind(this, function(){
			this.isRunning  =false;
		}));
	},
	checkGallaryBtnsStatus: function(){
		var left = parseInt($('#' + this.thumbsId).css('left'));
		if(this.total <= this.showThumbCount){
			$('#' + this.configs.photoGallaryPre).addClass(this.configs.photoGallaryBtnDisable);
			$('#' + this.configs.photoGallaryNext).addClass(this.configs.photoGallaryBtnDisable);
			return;
		}
		if(left >= 0){
			$('#' + this.configs.photoGallaryPre).addClass(this.configs.photoGallaryBtnDisable);
			return;
		}
		
		if(left <= this.maxOffset){
			$('#' + this.configs.photoGallaryNext).addClass(this.configs.photoGallaryBtnDisable);
			return;
		}
	},
	next: function(){
		$('#' + this.configs.thumbPrefix + this.cursor).removeClass(this.configs.selectedClass);
		var left = $('#' + this.configs.thumbPrefix + this.cursor)[0].offsetLeft + parseInt($('#' + this.thumbsId).css('left'));
		if(left >= this.configs.thumbWidth * (this.showThumbCount - 1)){
			if(this.cursor != this.total - 1){
				this.gallaryNext();
			}else{
				this.gallaryPre(this.total - this.showThumbCount);
			}
		}
		if(this.cursor >= this.total - 1){
			this.cursor = 0;
		}else{
			this.cursor ++;
		}
		this.show(this.cursor);
	},
	preview: function(){
		$('#' + this.configs.thumbPrefix + this.cursor).removeClass(this.configs.selectedClass);
		var left = $('#' + this.configs.thumbPrefix + this.cursor)[0].offsetLeft + parseInt($('#' + this.thumbsId).css('left'));
		if(left <= 0){
			if(this.cursor != 0){
				this.gallaryPre();
			}else{
				this.gallaryNext(this.total - this.showThumbCount);
			}
		}
		if(this.cursor <= 0){
			this.cursor = this.total - 1;
		}else{
			this.cursor --;
		}
		this.show(this.cursor);
	},
	show: function(cursor){
		//$('#big_img').fadeOut('fast',dk.bind(this, function(){
			$('#' + this.configs.thumbPrefix + cursor).addClass(this.configs.selectedClass);
			$('#photo_big_url').attr('href', $('#' + this.configs.thumbPrefix + cursor + ' img').attr('bigurl'));
			var tempImg = new Image();
			
			var that = this;
			//$('#big_img').attr('src', tempImg.src);
			dk.logs.write('begin load');
			tempImg.onload = function(){
				dk.logs.write('complete');
				this.onload = null;
				$('#big_img').css('margin-top', - tempImg.height / 2);
				$('#big_img').attr('src', tempImg.src);
				//$('#big_img').fadeIn('fast', dk.bind(that, function(){
					this.isRunning = false;
				//}));
				that.isRunning = true;
				tempImg = null;
			}
			tempImg.src = $('#' + this.configs.thumbPrefix + cursor + ' img').attr('middleurl');
			/*
			if(parseInt(tempImg.width) < this.configs.showWidth){
				$('#big_img').attr('width', tempImg.width);
			}else{
				$('#big_img').attr('width', this.configs.showWidth);
			}
			*/
			this.isRunning = false;
		//}));
		//this.isRunning = true;
	},
	canNext: function(){},
	cantNext: function(){}
};