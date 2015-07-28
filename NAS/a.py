import re
s = """{
    "DISK1": {
	"name": "DISK1",
	"size": "500GB",
	"status": "Foreign",
	"vendor": "ST9500325AS     0020",
	"volume": "Unassigned" 
    },

}
"""
line = re.sub('{','[', s.rstrip())
line = re.sub('}',']',line.rstrip())
line = re.sub('],',']',line.rstrip())
print line
