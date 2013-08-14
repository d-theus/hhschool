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

test_events = new Object();
test_events[(new Date(2013,8,8)).toDateString()] =  cevent.create("oneone", "", ["me", "also me"]);
test_events[(new Date(2013,8,14)).toDateString()] = cevent.create("twowo", "", ["not me", "ehh"]);

localStorage.setItem("cevents", JSON.stringify(test_events));
cevents = JSON.parse(localStorage["cevents"]);


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

function find_events_by_date (date) {
	return cevents[date.toDateString()];
}

function people_helper(ppl){
	if (ppl == null || ppl === undefined) return null;
	return (ppl instanceof Array) ? ppl.join() : ppl;
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
		if(i%7 == 0 && i > 0){
			$("#calendar").append(mktag("tr"));

		}
		td.data("date",JSON.stringify(day.toString()));
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
			if ( ev.title == null){
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
			dpp.data("date",td.data("date"));
			popupRight($("#day-popup"),$(this));
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
	$(".popup-arrow").remove();
	$(".popup").hide();
	var pos = par.position();
	popup.css({ "display":"block"});

	popup.find(".popup-close").on("click",function(e) {
		e.preventDefault();
		e.stopPropagation();
		$(this).closest(".popup").css({"display":"none"});
		$(".popup-arrow").remove();
	});
}

function popupUnder (popup,par) {
	popupGen(popup,par);
	var pos = par.position();
	popup.css({
		"top":pos.top+par.height()*1.3,
		"left":pos.left+par.width()*0.5});

	popup.parent().append('<div class="popup-arrow popup-arrow-up"></div>');

	$(".popup-arrow").css({
		"top":popup.position().top - 4,
		"left":popup.position().left + 2,
		"display":"block"});
}
function popupRight (popup,par) {
	popupGen(popup,par);
	var pos = par.position();
	popup.css({
		"top":pos.top+par.height()/2 - popup.height()/2,
		"left":pos.left+par.width()*1.2});

	popup.parent().append('<div class="popup-arrow popup-arrow-left"></div>');

	$(".popup-arrow").css({
		"top":popup.position().top + popup.height()/2,
		"left": popup.position().left - 4, 
		"display":"block"});
}

function valid_event(ev) {
return ev.title != null && ev.title.length > 0;
}

$(document).ready(function() {

	$("#next-month").on("click",function() {
		incMonth();
	});
	$("#prev-month").on("click",function() {
		decMonth();
	});
	$("#today-button").on("click",function() {
		fill_calendar(today);
		$(".today").trigger("click");
	});
	$("#day-popup").on("click","#done",function() {
		var ppp = $(this).closest("#day-popup");
		var date = new Date(ppp.data("date"));

		var ititle = ppp.find("#ititle");
		var idesc = ppp.find("#idesc");
		var ipeople = ppp.find("#ipeople");

		var ititle_mod = ititle.is(":visible");
		var idesc_mod = idesc.is(":visible");
		var ipeople_mod = ipeople.is(":visible");

		var t = ititle_mod ?  ititle.val() : ppp.find("#title").text();
		var d = idesc_mod ?   idesc.val()  : ppp.find("#l-desc").text();
		var p = ipeople_mod ? ipeople.val(): ppp.find("#l-people").text();

		ev = cevent.create(t,d,p);

		if (valid_event(ev)){
			cevents[date.toDateString()] = ev;
		}else{
			alert("Некоторые важные поля не заполнены");
			return false;
		}
		localStorage.setItem("cevents",JSON.stringify(cevents));
		ppp.find(".popup-close").trigger("click");
		fill_calendar(date);
	});
	$("#day-popup").on("click","#remove",function() {
		alert("okay remove");
	});

	fill_calendar(today);
});
