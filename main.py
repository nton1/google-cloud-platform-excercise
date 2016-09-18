# Copyright 2013 Google, Inc
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#             http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

from datetime import datetime

from json import dumps

import json

import random

import model

import webapp2

import time







def AsDict(simulation):
    simulation_date = dumps(simulation.date_simulation, default=json_serial)
    return {'id': simulation.key.id(), 'datetime': simulation_date}

def AsDictStatistics(statistics):
    return {
        'differentNumbers':statistics.amount_different_numbers,
        'percentale050': statistics.percent_0_50,
        'extractedNumberPercent':statistics.extracted_number_percent,
        'timeExecution':statistics.time_execution
    }


def json_serial(obj):
    """JSON serializer for objects not serializable by default json code"""

    if isinstance(obj, datetime):
        serial = obj.isoformat()
        return serial
    raise TypeError ("Type not serializable")


class RestHandler(webapp2.RequestHandler):

    def dispatch(self):
        # time.sleep(1)
        super(RestHandler, self).dispatch()

    def SendJson(self, r):
        self.response.headers['content-type'] = 'text/plain'
        self.response.write(json.dumps(r))


class StartSimulationHandler(RestHandler):

    def post(self):
        simulation = model.create_simulation()
        onetohundred = range(1, 6)
        onetothousand = range(1,21)
        start_time = time.time()
        for count in onetohundred:
            batch = model.create_batch(simulation)
            for count_launch in onetothousand:
                number_extracted = random.randint(0, 50)
                model.save_number(number_extracted, batch)
                # print number_extracted, count_launch, count
        simulation.time_execution = (time.time() - start_time)
        simulation.put()
        print("--- %s seconds ---" % (time.time() - start_time))
        statistics = model.generate_statistics(simulation)

        #model.get_different_numbers(simulation)
        r = AsDict(simulation)
        # print r
        self.SendJson(r)


class QueryHandler(RestHandler):

    def get(self):
        simulations = model.all_simulations()
        r = [AsDict(simulation) for simulation in simulations]
        self.SendJson(r)

class QueryHandlerStatistics(RestHandler):

    def post(self):
        r = json.loads(self.request.body)
        statistics = model.get_statistics(r['idsimulation'])
        r = [AsDictStatistics(statistic) for statistic in statistics]
        r = r[0]
        self.SendJson(r)


class LoginHandler(RestHandler):

    def post(self):
        r = json.loads(self.request.body)
        user = r['email']
        password = r['password']
        if(user=='test@test.com' and password=='test'):
            r = {'user':'revevol'}
        else:
            r = 'ko'
        self.SendJson(r)



class DeleteHandler(RestHandler):

    def post(self):
        model.delete_all_simulations()




APP = webapp2.WSGIApplication([
    ('/rest/query', QueryHandler),
    ('/rest/start', StartSimulationHandler),
    ('/rest/deletenumbers', DeleteHandler),
    ('/rest/getstatistics', QueryHandlerStatistics),
    ('/rest/login', LoginHandler),
    # ('/rest/update', UpdateHandler),
], debug=True)
