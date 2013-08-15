dows=["Понедельник","Вторник","Среда","Четверг","Пятница","Суббота","Воскресенье"];
months = ["Январь", "Февраль","Март","Апрель","Май","Июнь","Июль","Август","Сентябрь","Октябрь","Ноябрь","Декабрь" ];
months_s = ["января", "февраля","марта","апреля","мая","июня","июля","августа","сентября","октября","ноября","декабря" ];
today = new Date();
month = today.getMonth();
year = today.getFullYear();

cevent = {
	title: "",
	desc: "",
	people: [],
	create: function(title, desc, people) {
		var res = $.extend(true, {}, this);
		res.title = title;
		res.desc = desc || "";
		res.people = people || [];
		return res;
	}

};

cevents = JSON.parse(localStorage["cevents"] || "{}");


function clone(obj) {
	return $.extend(true, {}, obj);
}

function mktag (tag) {
	return $("<"+tag+"></"+tag+">");
}

function mktagcontent(tag,content){
	return $("<"+tag+">"+content+"</"+tag+">");
}

function dates_eq(d1,d2){
	return d1.getFullYear()==d2.getFullYear() &&
		d1.getMonth()==d2.getMonth() &&
		d1.getDate()==d2.getDate();
}

function object_like(obj, query) {
	var query_s = query.split(' ');
	var regexps = [];
	for (var i in query_s){
		var re = new RegExp(query_s[i], "i");
		regexps.push(re);
	}
	for (var prop in obj){
		if(obj.hasOwnProperty(prop)){
			var str = "";
			if(prop instanceof Array){
				str = obj[prop].join();
			}else{
				str = obj[prop].toString();
				if(prop == "date"){
					alert(str);
				}
			}
			for(var i in regexps){
				if(str.search(regexps[i]) >= 0){
					return true;
				}
			}
		}
	}
	return false;
}

function string_like (str, query) {
	var query_s = query.split(' ');
	var regexps = [];
	for (var i in query_s){
		var re = new RegExp(query_s[i], "i");
		regexps.push(re);
	}
	for(var i in regexps){
		if(str.search(regexps[i]) >= 0){
			return true;
		}
	}
	return false;
}

function find_events_by_date (date) {
	return cevents[date.toDateString()];
}

function find_events_fuzzy(query){
	var results = [];
	for (k in cevents){
		if(object_like(cevents[k], query) || string_like(k,query) ){
			var res = {};
			res.ev = cevents[k];
			res.date = new Date(k);
			results.push(res);
		}
	}
	return results;
}

function people_helper(ppl){
	if (ppl == null || ppl === undefined) return null;
	return (ppl instanceof Array) ? ppl.join() : ppl;
}

function date_short_helper (date) {
	return date.getDate().toString()+" "+
		months_s[date.getMonth()]+" "+
		date.getFullYear().toString();
}

function fill_calendar(d){
	var fdm = new Date(d.getFullYear(), d.getMonth(), 1);
	var ldm = new Date(d.getFullYear(), d.getMonth()+1, 0);

	var month = d.getMonth();
	var offset1 = fdm.getDay() == 0 ? 7 : fdm.getDay();
	var offset2 = 6 - ldm.getDay();
	var dayCount = offset1+offset2+ldm.getDate();

	var day = new Date(fdm.setDate(fdm.getDate() - offset1 + 1));
	var i = 0;

	$("#calendar").html(mktag("tbody"));
	$("#calendar tbody").append(mktag("tr"));
	while(i < dayCount){
		var dow = i < 7 ? dows[i]+", " : "";
		var td = mktag("td").append(dow+day.getDate()).addClass("day");
		if(dates_eq(today, day)){
			td.addClass("today");
		}
		if(dates_eq(d, day)){
			td.addClass("marked");
		}
		if(i%7 == 0 && i > 0){
			$("#calendar").append(mktag("tr"));

		}
		td.data("date",JSON.stringify(day.toDateString()));
		var ev = find_events_by_date(day);
		if (ev !== undefined){
			td.data("ev",JSON.stringify(ev));
			var ppl = people_helper(ev.people);
			td.append(mktagcontent( "p", ev.title+"</br>"+ ppl));
		} else{
			td.data("ev",JSON.stringify({}));
		}
		td.on("click", function() {
			var td = $(this).closest(".day");
			var ev = JSON.parse(td.data("ev")) || cevent.create();
			var date = new Date(JSON.parse(td.data("date"))) ;
			var dpp = $("#day-popup");
			if ( ev.title == null || ev.title.length == 0){
				dpp.find("#title").hide();
				dpp.find("#ititle").show();
			}else{
				dpp.find("#title").text(ev.title);
				dpp.find("#title").show();
				dpp.find("#ititle").hide();
			}
			if( ev.people == null){
				dpp.find("#people").hide();
				dpp.find("#ipeople").show();
			}else{
				dpp.find("#l-people").text(people_helper(ev.people));
				dpp.find("#people").show();
				dpp.find("#ipeople").hide();
			}
			if (ev.desc == null) {
				dpp.find("#desc").hide();
				dpp.find("#idesc").show();
			}
			else{
				dpp.find("#desc").show();
				dpp.find("#l-desc").text(ev.desc);
				dpp.find("#idesc").hide();
			}
			dpp.find("#date").text(date.getDate().toString() + " " + months_s[date.getMonth()]);
			alert("assigning date to popup. date:\n"+ td.data("date") +
					"\nevent:\n"+JSON.stringify(ev));
			popupRight(dpp,$(this));
			dpp.data("date",td.data("date"));
			dpp.data("ev",ev);
		});
		$("#calendar tr:last").append(td);
		i++;
		day.setDate(day.getDate() +1);
	}
	$("#month").html(months[d.getMonth()]+" "+d.getFullYear());
}

function incMonth () {
	if (month == 11) {
		year++;
		month = 0;
	}else month++;
	var nd = new Date(year, month, 1);
	fill_calendar(dates_eq(today,nd) ? today : nd);
}

function decMonth () {
	if (month == 0) {
		year--;
		month = 11;
	}else month--;
	var nd = new Date(year, month, 1);
	fill_calendar(dates_eq(today,nd) ? today : nd);
}

function popupGen(popup,par){
	popupClose($(".popup"));
	var pos = par.position();
	popup.css({ "display":"block"});

	popup.find(".popup-close").on("click",function(e) {
		e.preventDefault();
		e.stopPropagation();
		popupClose($(this).closest(".popup"));
	});
}

function popupUnder (popup,par) {
	popupGen(popup,par);
	var pos = par.position();
	popup.css({
		"top":pos.top+par.height()*1.3,
		"left":pos.left+par.width()*0.5});

	popup.append('<div class="popup-arrow popup-arrow-up"></div>');

	$(".popup-arrow").css({
		"top":-4,
		"left":popup.width()/2-5,
		"display":"block"});
}

function popupRight (popup,par) {
	popupGen(popup,par);
	var pos = par.position();
	popup.css({
		"top":pos.top+par.height()/2 - popup.height()/2,
		"left":pos.left+par.width()*1.2});

	popup.append('<div class="popup-arrow popup-arrow-left"></div>');

	$(".popup-arrow").css({
		"top": popup.height()/2,
		"left": -4,
		"display": "block"
	});
}

function popupClose (popup) {
	popup.find(".popup-arrow").remove();
	popup.find(".row fieldset input, textarea").val("");
	popup.removeData("date");
	popup.removeData("ev");
	popup.hide();
}

function valid_event(ev) {
	return ev.title != null && ev.title.length > 0;
}

function search_result_item (result) {
	var itm = mktag("li");
	var div = itm.append(mktag("div")).find("div");
	div.append(mktag("p"))
		.find("p:last")
		.append(mktagcontent("strong",result.ev.title));
	div.append(mktag("p"))
		.find("p:last")
		.append(mktagcontent("small",date_short_helper(result.date)));
	div.addClass("highlightable");
	div.data("date", result.date.toDateString());
	div.on("click",function() {
		popupClose($(this).closest(".popup"));
		fill_calendar(new Date($(this).data("date")));
		$(".marked").trigger("click");
		$(".marked").removeClass("marked");
	});
	return itm;
}

function disable_submit_and_clr (ppp) {
	ppp.data("ev",null);
	ppp.data("date",null);
	ppp.find("#fast-create-submit").attr("disabled","true");
}

$(document).ready(function() {

	$("#next-month").on("click",function() {
		incMonth();
	});
	$("#prev-month").on("click",function() {
		decMonth();
	});
	$("#fast-create").on("click",function() {
		popupUnder($("#fast-create-popup"), $(this));
	})
	$("#today-button").on("click",function() {
		fill_calendar(today);
		$(".today").trigger("click");
	});
	$("#day-popup").on("click","#done",function() {
		var ppp = $(this).closest("#day-popup");
		var date = new Date(ppp.data("date"));
		fill_calendar(date);
		popupClose(ppp);
		//alert("checking popup values:\n"+
			//"date:\n"+ ppp.data("date") +
			//"\nevent:\n"+JSON.stringify(ppp.data("ev")));
	});
	$("#day-popup").on("click","#remove",function() {
		alert("okay remove");
	});
	$("#day-popup input,textarea").blur(function() {
		var ppp = $(this).closest("#day-popup");
		var date = new Date(ppp.data("date"));
		var ev = ppp.data("ev");
		switch($(this).attr("id")) {
			case 'ititle':
				ev.title = $(this).val();
				if ( ev.title.length > 0){
					ppp.find("#title").text(ev.title);
					ppp.find("#title").show();
					ppp.find("#ititle").hide();
				}
				break;
			case 'idesc':
				ev.desc = $(this).val();
				ppp.find("#desc").show();
				ppp.find("#l-desc").text(ev.desc);
				ppp.find("#idesc").hide();
				break;
			case 'ipeople':
				ev.people = ($(this).val().split(","));
				ppp.find("#l-people").text(people_helper(ev.people));
				ppp.find("#people").show();
				ppp.find("#ipeople").hide();
				break;
		}
		ppp.data("ev",ev);
		alert("current data in popup:\nevent:\n"+JSON.stringify(ev)+"date:\n"+date.toString());
		if(valid_event(ev)){
			cevents[date.toDateString()] = ev;
			localStorage.setItem("cevents", JSON.stringify(cevents));
		}
	});

	$("#day-popup .toggle").on("click",function(e) {
		e.preventDefault();
		var target = $(this).data("target");
		var ppp = $(this).closest(".popup");
		var lbl = ppp.find("#l-"+target);
		var inp = ppp.find("#i"+target);
		var cont = ppp.find("#"+target);
		inp.val(lbl.text().trim());
		inp.show();
		cont.hide();
	});

	$("#search-input").on("keyup",function() {
		var sr = $("#search-results-popup");
		popupClose(sr);
		sr.find("li").remove();
		var query = $(this).val();
		if(query.length > 0){
			var results = find_events_fuzzy(query);
			if(results.length > 0){
				for(var i in results){
					sr.find("ul").append(search_result_item(results[i]));
					popupUnder(sr,$("#search-input"));
				}
			}
		}
	});
	$("#search-results-popup").on("mouseenter",".highlightable",function() {
		$(this).toggleClass("highlighted");
	});
	$("#search-results-popup").on("mouseleave",".highlightable",function() {
		$(this).toggleClass("highlighted");
	});

	$("#fast-create-popup #fast-create-text").on("keyup",function(){
		var ppp = $(this).closest(".popup");
		var val = $(this).val();
		if(val.length == 0) {
			disable_submit_and_clr(ppp);
			return;
		}

		var strings = val.split(',');
		if (strings.length > 1)
			var date = new Date(strings[0]);
		else{
			disable_submit_and_clr(ppp);
			return;
		}
		if(date == "Invalid Date") {
			alert("Непонятно, что за дата. Формат гггг-мм-дд.");
			disable_submit_and_clr(ppp);
			return;
		}
		
		var event_title = strings[1] || "";
		if(event_title != null && event_title.length > 0){
			ppp.find("#fast-create-submit").removeAttr("disabled");
			ppp.data("ev",JSON.stringify(cevent.create(event_title)) );
			ppp.data("date",date.toDateString());
		}
		else{
			disable_submit_and_clr(ppp);
		}
	});
	$("#fast-create-submit").on("click",function() {
		var ppp = $(this).closest(".popup");
		var date = ppp.data("date");
		var ev = JSON.parse(ppp.data("ev"));
		cevents[date] = ev;
		localStorage.setItem("cevents", JSON.stringify(cevents));
		popupClose($("#fast-create-popup"));
		fill_calendar(new Date(date));
	});

	fill_calendar(today);
	});
